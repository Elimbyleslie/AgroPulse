export interface Purchase {
  id?: number;
  supplierId?: number;
  farmId: number;
  totalAmount?: number;
  purchaseDate?: string; // ISO
  invoiceRef?: string;
  createdAt?: string;
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}