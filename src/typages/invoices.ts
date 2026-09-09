import { Subscription } from  "./subscription.js";
import {SubscriptionPayment } from './subcriptionPayment.js'
import { PaymentMethod } from "./payment.js";
export interface Invoice {
  id: number;
  organizationId: number;
  subscriptionId?: number | null;
  number: string;
  status: InvoiceStatus;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  issuedAt: string;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  method?:PaymentMethod

  organization?: any;
  subscription?: Subscription | null;
  payments?: SubscriptionPayment[];
}

export enum InvoiceStatus {
  DRAFT="DRAFT",
  OPEN="OPEN",
  PAID="PAID",
  VOID="VOID",
  UNCOLLECTIBLE="UNCOLLECTIBLE",
}