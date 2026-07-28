import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { enqueueJob, getQueuePosition } from '@/lib/queue';
import { ensureDir } from '@/lib/ffmpeg';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

export const config = { api: { bodyParser: false } };

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';
ensureDir(UPLOAD_DIR);

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 2048) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /video\/(mp4|quicktime|webm|x-matroska|avi)/.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => (result instanceof Error ? reject(result) : resolve(result)));
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Sign in required' });

  try {
    await runMiddleware(req, res, upload.array('videos', 20));
    const files = (req as any).files as Express.Multer.File[];
    if (!files?.length) return res.status(400).json({ error: 'No videos received' });

    const options = JSON.parse((req.body?.options as string) || '{}');
    const userId = (session.user as any).id as string;

    const created = [];
    for (const file of files) {
      const job = await prisma.job.create({
        data: {
          userId,
          originalName: file.originalname,
          inputPath: file.path,
          options,
          status: 'queued',
          stage: 'Queued',
        },
      });
      await enqueueJob(job.id);
      const position = await getQueuePosition(job.id);
      await prisma.job.update({ where: { id: job.id }, data: { queuePosition: position } });
      created.push(job);
    }

    res.status(201).json({ jobs: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Upload failed' });
  }
}
