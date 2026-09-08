import dotenv from "dotenv";
dotenv.config();

export const config = {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },

  queues: {
    main: "ant-tasks",
    dlq: "ant-tasks-dlq",
  },

  retry: {
    maxAttempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },

  worker: {
    concurrency: 3,
  },

  scheduler: {
    checkInterval: 5000,
  },
};
export const TASKS_TYPES = [
  "forage",
  "build",
  "defend",
  "attack",
  "clean",
  "scout",
] as const;
export type TaskType = (typeof TASKS_TYPES)[number];
