import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { config, TASKS_TYPES } from "./config";
import { TaskData, TaskResult } from "./types";
import winston from "winston/lib/winston/config";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});

const redis = new Redis(config.redis);

export const mainQueue = new Queue<TaskData>(config.queues.main, {
  connection: config.redis,
  defaultJobOptions: {
    attempts: config.retry.maxAttempts,
    backoff: {
      type: config.retry.backoff.type,
      delay: config.retry.backoff.delay,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const dlq = new Queue<TaskData>(config.queues.dlq, {
  connection: config.redis,

  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export async function dispatchTask(
  action: TaskData["action"],
  payload?: Record<string, any>,
  priority: TaskData["priority"] = "medium",
): Promise<string> {
  const taskId = `task-${Date.now()} - ${Math.random().toString(36).substr(2, 9)}`;

  const job = await mainQueue.add(
    action,
    {
      taskId,
      action,
      priority,
      payload,
      createdAt: new Date(),
      attempts: 0,
    } as TaskData,
    {
      priority: priority === "high" ? 1 : priority === "medium" ? 5 : 10,
      attempts: config.retry.maxAttempts,
    },
  );

  logger.info(
    `Dispatched task ${taskId} with action ${action} and priority ${priority}`,
  );
  return taskId;
}
