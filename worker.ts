import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processJob } from './lib/editor';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 2);

const worker = new Worker(
  'video-processing',
  async (job) => {
    const { jobId } = job.data as { jobId: string };
    console.log(`[worker] processing job ${jobId}`);
    await processJob(jobId);
  },
  { connection, concurrency: CONCURRENCY }
);

worker.on('completed', (job) => console.log(`[worker] completed ${job.id}`));
worker.on('failed', (job, err) => console.error(`[worker] failed ${job?.id}:`, err.message));

console.log(`VidMorphX worker started (concurrency=${CONCURRENCY})`);
