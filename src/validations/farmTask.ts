import yup from "yup";

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

export const createTaskSchema = yup.object({
  farmId: yup.number().required("Farm ID is required"),
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  assignedToUserId: yup.number().optional(),
  dueDate: yup.date().optional(),
  status: yup
    .mixed<TaskStatus>()
    .oneOf(Object.values(TaskStatus))
    .required("Status is required"),
});

export const updateTaskSchema = yup.object({
  title: yup.string().optional(),
  description: yup.string().optional(),
  assignedToUserId: yup.number().optional(),
  dueDate: yup.date().optional(),
  status: yup.mixed<TaskStatus>().oneOf(Object.values(TaskStatus)).optional(),
});