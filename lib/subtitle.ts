import fs from 'fs';
import path from 'path';
import { transcribeForSubtitles } from './gemini';

function toSrtTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

/**
 * Transcribe the source video with Gemini and write an .srt file next to
 * it. Returns the path, or null if transcription is unavailable/fails
 * (the pipeline should degrade gracefully rather than fail the whole job).
 */
export async function generateSrt(inputPath: string, outDir: string): Promise<string | null> {
  // Gemini subtitles are temporarily disabled (free-tier quota / not yet on a paid
  // plan). Re-enable by removing this early return once Gemini billing is set up.
  return null;

  // eslint-disable-next-line no-unreachable
  try {
    const segments = await transcribeForSubtitles(inputPath, 'video/mp4');
    if (!segments?.length) return null;

    const lines = segments
      .map(
        (seg, i) =>
          `${i + 1}\n${toSrtTimestamp(seg.start)} --> ${toSrtTimestamp(seg.end)}\n${seg.text}\n`
      )
      .join('\n');

    const srtPath = path.join(outDir, `${path.parse(inputPath).name}.srt`);
    fs.writeFileSync(srtPath, lines, 'utf-8');
    return srtPath;
  } catch (err) {
    console.error('Subtitle generation failed, continuing without captions:', err);
    return null;
  }
}
