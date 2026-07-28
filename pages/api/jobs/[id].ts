import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { cancelJob, retryJob, enqueueJob } from '@/lib/queue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Sign in required' });
  const userId = (session.user as any).id as string;
  const id = req.query.id as string;

  const job = await prisma.job.findFirst({ where: { id, userId } });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (req.method === 'GET') return res.status(200).json({ job });

  if (req.method === 'DELETE') {
    await cancelJob(id);
    await prisma.job.update({ where: { id }, data: { status: 'cancelled', stage: 'Cancelled' } });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST' && req.query.action === 'retry') {
    await prisma.job.update({ where: { id }, data: { status: 'queued', stage: 'Queued', progress: 0, errorMessage: null } });
    await retryJob(id);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
