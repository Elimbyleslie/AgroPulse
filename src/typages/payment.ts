import { PaymentMethod, PaymentStatus  } from "../../generated/prisma/enums.js";

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
