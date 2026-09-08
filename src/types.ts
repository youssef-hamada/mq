export interface TaskData {
  taskId: string;
  action: "forage" | "build" | "defend" | "attack" | "clean" | "scout";
  priority?: "high" | "medium" | "low";
  payload?: Record<string, any>;
  createdAt: Date;
  attempts?: number;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  error?: string;
  processedAt: Date;
  attempts?: number;
}
