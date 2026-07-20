import { PaymentMethod } from "../../generated/prisma/enums.js";

export interface Payment {
  id: number;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference: string;
  description?: string;
  userId?: number;
  saleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum PaymentStatus  {
  PENDING= 'PENDING',
  SUCCESS= 'SUCCESS',
  FAILED= 'FAILED',
  CANCELLED= 'CANCELLED',
  REFUNDED= 'REFUNDED'
} 
