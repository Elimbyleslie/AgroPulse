export interface Purchase {
  id: number;
  supplierId: number;
  farmId: number;
  totalAmount: number;
  itemName:string;
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
  RECEIVED="RECEIVED",
  CANCELLED = "CANCELLED",
}
