import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

type Job = {
  id: string; originalName: string; status: string; stage: string; progress: number;
  queuePosition: number; createdAt: string; thumbnailPath?: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const res = await fetch('/api/jobs');
      if (res.ok) setJobs((await res.json()).jobs);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [session]);

  async function cancel(id: string) {
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
  }
  async function retry(id: string) {
    await fetch(`/api/jobs/${id}?action=retry`, { method: 'POST' });
  }

  const completed = jobs.filter((j) => j.status === 'completed').length;
  const active = jobs.filter((j) => ['queued', 'processing', 'uploading', 'analyzing'].includes(j.status)).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold mb-10">
        Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Videos completed', value: completed },
          { label: 'In queue', value: active },
          { label: 'Credits remaining', value: '—' },
          { label: 'Storage used', value: '—' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="font-display text-2xl font-semibold text-gradient">{s.value}</div>
            <div className="text-xs text-white/50 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg mb-4">Upload history</h2>
      <div className="space-y-3">
        {jobs.length === 0 && (
          <div className="glass rounded-xl p-8 text-center text-white/50">
            No videos yet. <a href="/upload" className="text-violet">Upload your first one</a>.
          </div>
        )}
        {jobs.map((j) => (
          <div key={j.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="w-20 h-12 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
              {j.thumbnailPath && <img src={`/api/jobs/${j.id}/download`} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{j.originalName}</div>
              <div className="text-xs text-white/50">{j.stage} {j.status === 'queued' && j.queuePosition ? `· #${j.queuePosition} in queue` : ''}</div>
              <div className="h-1 rounded-full bg-white/10 mt-2 overflow-hidden">
                <div className="h-full bg-grad-primary" style={{ width: `${j.progress}%` }} />
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-shrink-0">
              {j.status === 'completed' && (
                <a href={`/api/jobs/${j.id}/download`} className="px-3 py-1.5 rounded-lg bg-grad-primary">Download</a>
              )}
              {j.status === 'failed' && (
                <button onClick={() => retry(j.id)} className="px-3 py-1.5 rounded-lg border border-edge">Retry</button>
              )}
              {['queued', 'processing'].includes(j.status) && (
                <button onClick={() => cancel(j.id)} className="px-3 py-1.5 rounded-lg border border-edge">Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
