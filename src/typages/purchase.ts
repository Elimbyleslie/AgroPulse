export interface Purchase {
  id: number;
  supplierId: number;
  farmId: number;
  totalAmount: number;
  notes?: string;
  purchaseDate: string; 
  invoiceNumber?: string;
  createdAt: string;
  taxAmount?: number;
  status: PurchaseStatus;
  createdById?: number;
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}
