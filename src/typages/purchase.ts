export interface Purchase {
  id: number;
  name: string;
  supplierId: number;
  farmId: number;
  totalAmount?: number;
  description?: string;
  purchaseDate?: string; // ISO
  invoiceRef: string;
  createdAt: string;
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}