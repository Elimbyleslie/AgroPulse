export enum FeedCategory {
  CONCENTRATE = "CONCENTRATE",
  FORAGE = "FORAGE",
  SUPPLEMENT = "SUPPLEMENT",
  MINERAL = "MINERAL",
  SILAGE = "SILAGE",
  OTHER = "OTHER",
}

export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  EXPIRED = "EXPIRED",
}

export interface FeedStock {
  id: number;
  farmId: number;
  name: string;
  category?: FeedCategory;
  quantity: number;           // Decimal → number dans TS (ou Prisma.Decimal)
  unit: string;
  minQuantity?: number;
  unitPrice?: number;
  totalValue?: number;
  expiryDate?: Date | null;
  location?: string | null;
  supplierId?: number | null;
  sku?: string | null;
  status: StockStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  farm?: any;
  supplier?: any;
  feedUsages?: any[];
  animalFeedings?: any[];
  feedingPlans?: any[];
}

// Pour la création
export type CreateFeedStockInput = Omit<FeedStock, 
  'id' | 'createdAt' | 'updatedAt' | 'totalValue' | 'status'
> & {
  quantity: number;
  totalValue?: number;
  status?: StockStatus;
};

// Pour la mise à jour
export type UpdateFeedStockInput = Partial<CreateFeedStockInput>;