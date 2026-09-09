
export interface Supplier {
  id?: number;
  category: SupplierCategory;
  name: string;
  email?: string | null;
  phone?: string | null;
  farmId?: number | null;
}

export interface FeedPurchase {
  id?: number;
  supplierId: number;
  farmId: number;
  itemName: string;
  quantity: number;
  unitPrice?: number | null;
  totalAmount: number;
}

export enum SupplierCategory {
  FEED = "FEED",
  MEDICAL = "MEDICAL",
  EQUIPMENT = "EQUIPMENT",
  SERVICE = "SERVICE",
  OTHER = "OTHER",
}