import { AlertStatus } from "../../generated/prisma/enums.js";

export interface Alert {
    id: number;
    farmId: number;
    title: string;
    message: string;
    date: Date;
    status: AlertStatus;
  
}