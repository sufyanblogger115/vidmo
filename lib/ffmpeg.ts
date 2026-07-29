import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath.path);

export interface ProbeResult {
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
}

/** Inspect a video file: duration, resolution, framerate, whether it has audio. */
export function probe(filePath: string): Promise<ProbeResult> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);
      const video = data.streams.find((s) => s.codec_type === 'video');
      const audio = data.streams.find((s) => s.codec_type === 'audio');
      const [num, den] = (video?.r_frame_rate || '30/1').split('/').map(Number);
      resolve({
        durationSec: Number(data.format.duration || 0),
        width: video?.width || 1920,
        height: video?.height || 1080,
        fps: den ? num / den : 30,
        hasAudio: !!audio,
      });
    });
  });
}

/**
 * Detect silent stretches using ffmpeg's silencedetect filter. Used for
 * silence removal and for trimming dead air at the start/end of a clip.
 */
export function detectSilence(
  filePath: string,
  noiseDb = -30,
  minDurationSec = 0.6
): Promise<{ start: number; end: number }[]> {
  return new Promise((resolve, reject) => {
    const ranges: { start: number; end: number }[] = [];
    let pendingStart: number | null = null;

    ffmpeg(filePath)
      .audioFilters(`silencedetect=noise=${noiseDb}dB:d=${minDurationSec}`)
      .format('null')
      .on('stderr', (line) => {
        const startMatch = line.match(/silence_start:\s*([\d.]+)/);
        const endMatch = line.match(/silence_end:\s*([\d.]+)/);
        if (startMatch) pendingStart = parseFloat(startMatch[1]);
        if (endMatch && pendingStart !== null) {
          ranges.push({ start: pendingStart, end: parseFloat(endMatch[1]) });
          pendingStart = null;
        }
      })
      .on('end', () => resolve(ranges))
      .on('error', reject)
      .save('-');
  });
}

/**
 * Detect scene cuts using ffmpeg's scene-change score. Returns cut
 * timestamps (in seconds) used for smart-cut / highlight selection.
 */
export function detectScenes(filePath: string, threshold = 0.4): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const cuts: number[] = [];
    ffmpeg(filePath)
      .videoFilters(`select='gt(scene,${threshold})',showinfo`)
      .format('null')
      .on('stderr', (line) => {
        const match = line.match(/pts_time:([\d.]+)/);
        if (match) cuts.push(parseFloat(match[1]));
      })
      .on('end', () => resolve(cuts))
      .on('error', reject)
      .save('-');
  });
}

export interface EditOptions {
  aspect?: 'vertical' | 'horizontal' | 'square' | 'original';
  trimSilence?: boolean;
  colorCorrect?: boolean;
  cinematicGrade?: boolean;
  denoise?: boolean;
  stabilize?: boolean;
  sharpen?: boolean;
  vignette?: boolean;
  filmGrain?: boolean;
  frameInterpolate?: boolean;
  speed?: number; // 1 = normal, <1 = slow-mo, >1 = fast
  fadeInOut?: boolean;
  watermarkText?: string;
  subtitlesPath?: string; // path to .srt to burn in
  quality?: '720p' | '1080p' | '1440p' | '4K';
  format?: 'mp4' | 'mov' | 'webm';
  trimRanges?: { start: number; end: number }[]; // ranges to CUT OUT
}

const QUALITY_HEIGHT: Record<NonNullable<EditOptions['quality']>, number> = {
  '720p': 720,
  '1080p': 1080,
  '1440p': 1440,
  '4K': 2160,
};

/**
 * Build the ffmpeg video-filter chain for one job from the selected
 * options. Filters are composed in a fixed, dependency-safe order.
 */
export function buildFilterChain(
  opts: EditOptions,
  srcWidth: number,
  srcHeight: number,
  durationSec = 0
): string[] {
  const filters: string[] = [];
  const targetH = QUALITY_HEIGHT[opts.quality || '1080p'];

  // --- Aspect / crop -------------------------------------------------
  if (opts.aspect && opts.aspect !== 'original') {
    const ratios: Record<string, number> = { vertical: 9 / 16, horizontal: 16 / 9, square: 1 };
    const targetRatio = ratios[opts.aspect];
    const srcRatio = srcWidth / srcHeight;
    if (targetRatio <= srcRatio) {
      // target is taller/narrower than source (e.g. landscape -> vertical) -> crop width, keep full height
      filters.push(`crop=ih*${targetRatio}:ih`);
    } else {
      // target is wider/shorter than source (e.g. portrait -> landscape) -> crop height, keep full width
      filters.push(`crop=iw:iw/${targetRatio}`);
    }
  }

  // --- Scale to target quality ----------------------------------------
  filters.push(`scale=-2:${targetH}:flags=lanczos`);

  // --- Stabilization (two-pass in practice; single-pass transform here) -
  if (opts.stabilize) filters.push('deshake');

  // --- Denoise ----------------------------------------------------------
  if (opts.denoise) filters.push('hqdn3d=4:3:6:4.5');

  // --- Color correction / auto exposure-contrast ------------------------
  if (opts.colorCorrect) filters.push('eq=contrast=1.06:brightness=0.02:saturation=1.12');

  // --- Cinematic grade (cool shadows, warm highlights, lifted blacks) ---
  if (opts.cinematicGrade) {
    filters.push('curves=preset=medium_contrast');
    filters.push('colorbalance=rs=-0.02:gs=0.0:bs=0.05:rm=0.03:gm=0.0:bm=-0.02');
  }

  // --- Sharpen ------------------------------------------------------------
  if (opts.sharpen) filters.push('unsharp=5:5:0.8:5:5:0.0');

  // --- Vignette -------------------------------------------------------------
  if (opts.vignette) filters.push('vignette=PI/4');

  // --- Film grain --------------------------------------------------------
  if (opts.filmGrain) filters.push('noise=alls=8:allf=t+u');

  // --- Frame interpolation / FPS enhancement --------------------------
  if (opts.frameInterpolate) filters.push("minterpolate='fps=60:mi_mode=mci:mc_mode=aobmc'");

  // --- Speed ramp -----------------------------------------------------
  if (opts.speed && opts.speed !== 1) filters.push(`setpts=${(1 / opts.speed).toFixed(4)}*PTS`);

  // --- Fade in/out ------------------------------------------------------
  if (opts.fadeInOut) {
    const fadeOutStart = Math.max(0, durationSec - 0.6);
    filters.push(`fade=t=in:st=0:d=0.6,fade=t=out:st=${fadeOutStart.toFixed(2)}:d=0.6`);
  }

  // --- Watermark (drawtext, bottom-right) -------------------------------
  if (opts.watermarkText) {
    const text = opts.watermarkText.replace(/'/g, "\\'");
    filters.push(
      `drawtext=text='${text}':fontcolor=white@0.65:fontsize=22:x=w-tw-24:y=h-th-24:shadowcolor=black@0.5:shadowx=2:shadowy=2`
    );
  }

  // --- Subtitles (burn-in) ------------------------------------------------
  if (opts.subtitlesPath) {
    const escaped = opts.subtitlesPath.replace(/:/g, '\\:');
    filters.push(
      `subtitles='${escaped}':force_style='FontName=Inter,FontSize=20,PrimaryColour=&HFFFFFF&,OutlineColour=&H8B5CF6&,BorderStyle=3,Outline=1,Shadow=0'`
    );
  }

  return filters;
}

/** Run a single ffmpeg job: input -> filtered output, reporting progress. */
export function runEdit(
  inputPath: string,
  outputPath: string,
  opts: EditOptions,
  srcWidth: number,
  srcHeight: number,
  durationSec: number,
  onProgress?: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const filters = buildFilterChain(opts, srcWidth, srcHeight, durationSec);
    const format = opts.format || 'mp4';
    const codec = format === 'webm' ? 'libvpx-vp9' : 'libx264';
    const audioCodec = format === 'webm' ? 'libopus' : 'aac';

    let command = ffmpeg(inputPath);

    // Cut out detected silence / unwanted ranges by building a segment
    // select expression rather than re-encoding per-range (fast, single pass).
    if (opts.trimRanges?.length) {
      const keepExpr = opts.trimRanges
        .map((r) => `between(t,${r.start},${r.end})`)
        .join('+');
      filters.push(`select='not(${keepExpr})',setpts=N/FRAME_RATE/TB`);
    }

    const stderrLines: string[] = [];

    command
      .outputOptions(['-map 0:v:0', '-map 0:a:0?'])
      .videoFilters(filters)
      .videoCodec(codec)
      .audioCodec(audioCodec)
      .outputOptions(['-preset veryfast', '-crf 20', '-movflags +faststart'])
      .format(format)
      .on('start', (cmd) => console.log('[ffmpeg cmd]', cmd))
      .on('stderr', (line) => {
        stderrLines.push(line);
        if (stderrLines.length > 40) stderrLines.shift();
      })
      .on('progress', (p) => {
        if (onProgress && durationSec > 0 && p.timemark) {
          const parts = p.timemark.split(':').map(Number);
          const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
          onProgress(Math.min(99, Math.round((seconds / durationSec) * 100)));
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => {
        const detail = stderrLines.slice(-15).join('\n');
        reject(new Error(`${err.message}\n--- ffmpeg output ---\n${detail}`));
      })
      .save(outputPath);
  });
}

/** Extract a single frame as a JPEG thumbnail. */
export function generateThumbnail(inputPath: string, outputPath: string, atSec = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({ timestamps: [atSec], filename: path.basename(outputPath), folder: path.dirname(outputPath), size: '640x?' })
      .on('end', () => resolve())
      .on('error', reject);
  });
}

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
