import { SupplierCategory } from "../../generated/prisma/enums.js";


export interface Supplier {
  id?: number;
  category: SupplierCategory;
  name: string;
  email?: string | null;
  phone?: string | null;
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
