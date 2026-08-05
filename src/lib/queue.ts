import { Queue } from "bullmq";
import { env } from "./env";

export type RenderJobPayload = {
  jobId: string;
  userId: string;
  sourceUrl: string;
};

export const renderQueueName = "render";

export function createRenderQueue() {
  return new Queue<RenderJobPayload>(renderQueueName, {
    connection: { url: env.REDIS_URL },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000
    }
  });
}
