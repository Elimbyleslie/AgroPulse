import { TaskStatus } from '../../generated/prisma/enums';

export interface FarmTask {
    id: number;
    farmId: number;
    title: string;
    description?: string;
    assignedToUserId?: number;
    dueDate?: Date;
    status: TaskStatus;

}