
export interface FarmTask {
  id: number;
  farmId: number;
  title: string;
  description?: string | null;
  assignedTo?: number | null; 
  status: TaskStatus;
  dueDate?: string | null;
  createdBy: number;
  assignedUser?: { id: number; name: string; email?: string } | null;
  farm?: { id: number; name: string } | null;
};

export enum TaskStatus {
  pending = "pending",
  inProgress = "inProgress",
  completed = "completed",
  cancelled = "cancelled",
}
