import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const videoQueue = new Queue('video-processing', { connection });

export async function enqueueJob(jobId: string) {
  await videoQueue.add(
    'process-video',
    { jobId },
    {
      jobId, // dedupe: one BullMQ job per DB job row
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 500,
      removeOnFail: 500,
    }
  );
}

export async function cancelJob(jobId: string) {
  const job = await videoQueue.getJob(jobId);
  if (job) await job.remove();
}

export async function retryJob(jobId: string) {
  const job = await videoQueue.getJob(jobId);
  if (job) await job.retry();
  else await enqueueJob(jobId);
}

export async function getQueuePosition(jobId: string): Promise<number> {
  const waiting = await videoQueue.getWaiting();
  const idx = waiting.findIndex((j) => j.id === jobId);
  return idx === -1 ? 0 : idx + 1;
}
