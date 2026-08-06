

export interface Invoices {
  id: number;
  organizationId: number;
  subscriptionId: number;
  amount: number;
  status: InvoiceStatus;
  paymentMethod: string;
  currency: string;
  issuedAt: Date;
}

export enum InvoiceStatus  {
  pending = "pending",
  paid = "paid",
  overdue = "overdue",
}
