
export interface Inventory {
  id?: number;
  farmId: number;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
  minQuantity?: number;
  unitPrice?: number;
  totalValue?: number;
  expiryDate?: Date;
  location?: string;
  supplierId?: number;
  status?: StockStatus;
  sku?: string;
}


export enum InventoryCategory {
    FEED = "FEED", 
  MEDICINE = "MEDICINE",
  SUPPLEMENT = "SUPPLEMENT",
  FERTILIZER= "FERTILIZER",
  SEED = "SEED",
  EQUIPMENT = "EQUIPMENT",
  TOOL = "TOOL",
  CHEMICAL= "CHEMICAL",
  PACKAGING = "PACKAGING",
  FUEL = "FUEL",
  OTHER= "OTHER"
}

export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  EXPIRED = "EXPIRED"
}