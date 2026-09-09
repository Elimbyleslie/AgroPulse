import {Invoice} from './invoices.js';
import {PaymentMethod} from './payment.js'
import {Subscription} from './subscription.js'



export enum SubscriptionPaymentStatus {
  PENDING ="PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export interface SubscriptionPayment {
  id: number;
  organizationId: number;
  subscriptionId?: number | null;
  invoiceId?: number | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: SubscriptionPaymentStatus;
  provider?: string | null;
  providerRef?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  organization?: any;
  subscription?: Subscription | null;
  invoice?: Invoice | null;
}

export type CreateSubscriptionPaymentPayload = {
  organizationId: number;
  subscriptionId?: number | null;
  invoiceId?: number | null;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  provider?: string | null;
  providerRef?: string | null;
  notes?: string | null;
};