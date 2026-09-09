
export interface FarmTask {
  id: number;
  farmId: number;
  title: string;
  description?: string;
  assignedToUserId?: number;
  dueDate?: Date;
  status: TaskStatus;
}

export enum TaskStatus {
  pending = "pending",
  in_progress = "in_progress",
  completed = "completed",
  cancelled = "cancelled",
}
