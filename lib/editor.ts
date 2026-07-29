import path from 'path';
import fs from 'fs';
import { prisma } from './database';
import { probe, detectSilence, runEdit, generateThumbnail, ensureDir, EditOptions } from './ffmpeg';
import { generateSrt } from './subtitle';
import { STAGE_LABELS } from './effects';

const OUTPUT_DIR = process.env.OUTPUT_DIR || '/data/outputs';

async function setStage(jobId: string, stage: string, progress: number) {
  await prisma.job.update({ where: { id: jobId }, data: { stage, progress, status: 'processing' } });
}

/**
 * The full automatic-editing pipeline for one job. Runs entirely inside
 * the BullMQ worker process (see worker.ts) so uploads stay responsive.
 */
export async function processJob(jobId: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const opts = job.options as unknown as EditOptions;
  ensureDir(OUTPUT_DIR);

  try {
    await setStage(jobId, STAGE_LABELS.analyze, 5);

    try {
      const stat = fs.statSync(job.inputPath);
      console.log(`[editor] input file check: path=${job.inputPath} size=${stat.size} bytes`);
    } catch (statErr: any) {
      console.error(`[editor] input file MISSING: ${job.inputPath} — ${statErr.message}`);
      throw new Error(`Input file not found on disk: ${job.inputPath}. It may have been lost on a container restart (no persistent volume attached).`);
    }

    const info = await probe(job.inputPath);
    console.log('[editor] probe result:', JSON.stringify(info));

    let trimRanges: { start: number; end: number }[] | undefined;
    if (opts.trimSilence) {
      const silences = await detectSilence(job.inputPath);
      // Keep everything that ISN'T a detected silent gap.
      trimRanges = [];
      let cursor = 0;
      for (const s of silences) {
        if (s.start > cursor) trimRanges.push({ start: cursor, end: s.start });
        cursor = s.end;
      }
      if (cursor < info.durationSec) trimRanges.push({ start: cursor, end: info.durationSec });
    }

    await setStage(jobId, STAGE_LABELS.clean, 20);

    let subtitlesPath: string | null = null;
    if (opts.subtitlesPath !== undefined || (opts as any).subtitles) {
      await setStage(jobId, 'Generating captions', 30);
      subtitlesPath = await generateSrt(job.inputPath, OUTPUT_DIR);
    }

    await setStage(jobId, STAGE_LABELS.reframe, 40);
    await setStage(jobId, STAGE_LABELS.grade, 55);

    const outputName = `${job.id}.${opts.format || 'mp4'}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await setStage(jobId, STAGE_LABELS.render, 65);
    await runEdit(
      job.inputPath,
      outputPath,
      { ...opts, trimRanges, subtitlesPath: subtitlesPath || undefined },
      info.width,
      info.height,
      info.durationSec,
      async (pct) => {
        await prisma.job.update({
          where: { id: jobId },
          data: { progress: Math.min(95, 65 + Math.round(pct * 0.3)) },
        });
      }
    );

    console.log(`[editor] runEdit succeeded for job ${jobId}, generating thumbnail...`);

    await setStage(jobId, STAGE_LABELS.compress, 96);

    const thumbPath = path.join(OUTPUT_DIR, `${job.id}.jpg`);
    let thumbnailPath: string | null = thumbPath;
    try {
      await generateThumbnail(outputPath, thumbPath, Math.min(1, info.durationSec / 4));
    } catch (thumbErr) {
      console.error('[editor] thumbnail generation failed, continuing without it:', thumbErr);
      thumbnailPath = null;
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        stage: STAGE_LABELS.done,
        progress: 100,
        outputPath,
        thumbnailPath,
        metadata: { ...(job.metadata as object), durationSec: info.durationSec, width: info.width, height: info.height },
      },
    });
  } catch (err: any) {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'failed', errorMessage: String(err?.message || err) },
    });
    throw err;
  }
}
