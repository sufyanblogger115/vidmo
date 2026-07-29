import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { EFFECT_CATALOG, ASPECT_PRESETS } from '@/lib/effects';
import { motion } from 'framer-motion';

type QueuedFile = { file: File; jobId?: string; status: string; progress: number; stage: string };

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [aspect, setAspect] = useState<'vertical' | 'horizontal' | 'square' | 'original'>('vertical');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(EFFECT_CATALOG.map((e) => [e.key, e.defaultOn]))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pending = (window as any).__vmx_pending_files as FileList | undefined;
    if (pending?.length) {
      setFiles(Array.from(pending).map((file) => ({ file, status: 'pending', progress: 0, stage: 'Not uploaded yet' })));
      (window as any).__vmx_pending_files = undefined;
    }
  }, []);

  useEffect(() => {
    if (!files.some((f) => f.jobId && f.status !== 'completed' && f.status !== 'failed')) return;
    const interval = setInterval(async () => {
      const res = await fetch('/api/jobs');
      if (!res.ok) return;
      const { jobs } = await res.json();
      setFiles((prev) =>
        prev.map((f) => {
          const match = jobs.find((j: any) => j.id === f.jobId);
          return match ? { ...f, status: match.status, progress: match.progress, stage: match.stage } : f;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setFiles((prev) => [...prev, ...Array.from(list).map((file) => ({ file, status: 'pending', progress: 0, stage: 'Not uploaded yet' }))]);
  }

  async function startProcessing() {
    if (!session) return router.push('/login');
    const form = new FormData();
    files.forEach((f) => form.append('videos', f.file));
    form.append(
      'options',
      JSON.stringify({
        aspect,
        trimSilence: toggles.silenceRemoval,
        denoise: toggles.denoise,
        stabilize: toggles.stabilize,
        colorCorrect: toggles.colorCorrect,
        cinematicGrade: toggles.cinematicGrade,
        sharpen: toggles.sharpen,
        vignette: toggles.vignette,
        filmGrain: toggles.filmGrain,
        frameInterpolate: toggles.frameInterpolate,
        fadeInOut: toggles.fadeInOut,
        subtitles: toggles.subtitles,
        watermarkText: toggles.watermark ? 'VidMorphX' : undefined,
        quality: '1080p',
        format: 'mp4',
      })
    );

    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return alert(`Upload failed: ${body.error || res.statusText || 'unknown error'}`);
    }
    const { jobs } = await res.json();
    setFiles((prev) =>
      prev.map((f, i) => (jobs[i] ? { ...f, jobId: jobs[i].id, status: jobs[i].status, stage: jobs[i].stage } : f))
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold mb-2">Start editing</h1>
      <p className="text-white/50 mb-10">Add your footage, choose a format, and let the pipeline do the rest.</p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        className="glass rounded-2xl p-10 text-center mb-10 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-white/70">Drag videos here or click to browse</p>
        <input ref={inputRef} type="file" accept="video/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-10">
        <div>
          <h2 className="font-display text-lg mb-4">Output format</h2>
          <div className="grid grid-cols-2 gap-3">
            {ASPECT_PRESETS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAspect(a.key as any)}
                className={`text-left px-4 py-3 rounded-xl border text-sm ${aspect === a.key ? 'border-violet bg-violet/10' : 'border-edge hover:bg-white/5'}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg mb-4">Automatic edits</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {EFFECT_CATALOG.map((e) => (
              <label key={e.key} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-edge text-sm">
                {e.label}
                <input
                  type="checkbox"
                  checked={!!toggles[e.key]}
                  onChange={(ev) => setToggles((t) => ({ ...t, [e.key]: ev.target.checked }))}
                  className="accent-violet w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-lg mb-4">Processing queue</h2>
          <div className="space-y-3">
            {files.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="truncate max-w-xs">{f.file.name}</span>
                  <span className="text-white/50">{f.stage}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-grad-primary transition-all" style={{ width: `${f.progress}%` }} />
                </div>
                {f.status === 'completed' && f.jobId && (
                  <a href={`/api/jobs/${f.jobId}/download`} className="text-xs text-violet mt-2 inline-block">
                    Download result
                  </a>
                )}
                {f.status === 'failed' && <span className="text-xs text-red-400 mt-2 inline-block">Processing failed</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={startProcessing}
        disabled={!files.length || status === 'loading'}
        className="px-8 py-3 rounded-xl bg-grad-primary font-medium shadow-glow disabled:opacity-40"
      >
        {session ? 'Start editing' : 'Sign in to start editing'}
      </button>
    </div>
  );
}
