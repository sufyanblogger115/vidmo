import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Sign in required' });
  const userId = (session.user as any).id as string;
  const id = req.query.id as string;

  const job = await prisma.job.findFirst({ where: { id, userId } });
  if (!job?.outputPath || job.status !== 'completed') {
    return res.status(404).json({ error: 'Output not ready' });
  }

  const stream = fs.createReadStream(job.outputPath);
  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(job.originalName, path.extname(job.originalName))}-edited${path.extname(job.outputPath)}"`);
  res.setHeader('Content-Type', 'video/mp4');
  stream.pipe(res);
}
