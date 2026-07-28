import { EditOptions } from './ffmpeg';

/**
 * Catalog of automatic edits shown in the UI and applied by the pipeline.
 * Each entry maps a user-facing toggle to the concrete ffmpeg-level
 * option(s) it turns on in lib/ffmpeg.ts's buildFilterChain / editor.ts.
 * Grouped by stage so the dashboard can show "Detecting -> Cleaning ->
 * Grading -> Rendering" the same way the pipeline actually runs.
 */
export interface EffectDef {
  key: string;
  label: string;
  stage: 'analyze' | 'clean' | 'reframe' | 'grade' | 'finish';
  appliesOption: keyof EditOptions | 'auto';
  defaultOn: boolean;
}

export const EFFECT_CATALOG: EffectDef[] = [
  { key: 'sceneDetect', label: 'Scene detection & smart cuts', stage: 'analyze', appliesOption: 'auto', defaultOn: true },
  { key: 'silenceRemoval', label: 'Silence removal & auto trim', stage: 'clean', appliesOption: 'trimSilence', defaultOn: true },
  { key: 'denoise', label: 'Background noise / grain removal', stage: 'clean', appliesOption: 'denoise', defaultOn: true },
  { key: 'stabilize', label: 'Video stabilization', stage: 'clean', appliesOption: 'stabilize', defaultOn: false },
  { key: 'reframe', label: 'Smart reframe (vertical / square / horizontal)', stage: 'reframe', appliesOption: 'aspect', defaultOn: true },
  { key: 'colorCorrect', label: 'Auto color correction', stage: 'grade', appliesOption: 'colorCorrect', defaultOn: true },
  { key: 'cinematicGrade', label: 'Cinematic LUT-style grade', stage: 'grade', appliesOption: 'cinematicGrade', defaultOn: false },
  { key: 'sharpen', label: 'Sharpen', stage: 'grade', appliesOption: 'sharpen', defaultOn: false },
  { key: 'vignette', label: 'Vignette', stage: 'grade', appliesOption: 'vignette', defaultOn: false },
  { key: 'filmGrain', label: 'Film grain', stage: 'grade', appliesOption: 'filmGrain', defaultOn: false },
  { key: 'frameInterpolate', label: 'Frame interpolation / 60fps boost', stage: 'grade', appliesOption: 'frameInterpolate', defaultOn: false },
  { key: 'fadeInOut', label: 'Fade in / fade out', stage: 'finish', appliesOption: 'fadeInOut', defaultOn: true },
  { key: 'subtitles', label: 'Auto subtitles (animated burn-in)', stage: 'finish', appliesOption: 'subtitlesPath', defaultOn: true },
  { key: 'watermark', label: 'Watermark', stage: 'finish', appliesOption: 'watermarkText', defaultOn: false },
];

export const STAGE_LABELS: Record<EffectDef['stage'] | 'upload' | 'render' | 'compress' | 'done', string> = {
  upload: 'Uploading',
  analyze: 'Analyzing scenes & audio',
  clean: 'Cleaning audio & stabilizing',
  reframe: 'Reframing & cropping',
  grade: 'Applying color & effects',
  finish: 'Generating captions & watermark',
  render: 'Rendering',
  compress: 'Compressing',
  done: 'Completed',
};

export const ASPECT_PRESETS = [
  { key: 'vertical', label: 'TikTok / Reels / Shorts (9:16)' },
  { key: 'horizontal', label: 'YouTube (16:9)' },
  { key: 'square', label: 'Feed post (1:1)' },
  { key: 'original', label: 'Keep original' },
] as const;
