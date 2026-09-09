import { Plan } from "./plan.js";
import { Invoices } from "./invoices.js";
export enum  SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}
export enum RenewalType {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
}

export interface Subscription {
  id: number;
  organizationId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
  renewalType: RenewalType;
  status: SubscriptionStatus;
  plan: Plan;
  invoices:Invoices[];
}
