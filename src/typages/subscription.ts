import { Expense, Sale } from "./expenseSale.js";
import { Payment } from "./payment.js";
import { Invoice } from "./invoices.js";
import { Plan } from "./plan.js";
import { SubscriptionPayment } from "./subcriptionPayment.js";
// =====================================================
// ENUMS
// =====================================================

export type FinancialReportType =
  | "PROFIT_LOSS"
  | "CASHFLOW"
  | "BALANCE_SHEET"
  | "EXPENSE_ANALYSIS"
  | "REVENUE_ANALYSIS";

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  PAUSED = "PAUSED",
}

export enum BillingInterval {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

// =====================================================
// FINANCE FERME
// =====================================================

export interface FinancialReport {
  id: number;
  farmId: number;
  type: FinancialReportType;
  periodStart: string; // ISO date
  periodEnd: string;
  totalRevenue: number;
  totalExpense: number;
  grossProfit: number;
  netProfit: number;
  data: Record<string, unknown>; // Json
  generatedById?: number | null;
  createdAt: string;

  // relations optionnelles
  farm?: any;
  generatedBy?: { id: number; name?: string } | null;
}

// =====================================================
// ABONNEMENT (SaaS)
// =====================================================

export interface Subscription {
  id: number;
  organizationId: number;
  planId: number;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  amount: number;
  currency: string;
  trialStart?: string | null;
  trialEnd?: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string | null;
  endedAt?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  organization?: any;
  plan?: Plan;
  invoices?: Invoice[];
  payments?: SubscriptionPayment[];
}

export type CreateSubscriptionPayload = {
  organizationId: number;
  planId: number;
  billingInterval?: BillingInterval;
  trialDays?: number;
};
