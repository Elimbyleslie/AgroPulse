import { ProductCategory } from "../../generated/prisma/enums.js";


export interface ProductionCreateInput {
  farmId: number;
  lotId?: number | null;
  animalId?: number | null;
  herdId?: number | null;
  penId?: number | null;
  date?: string | Date;
  Category: ProductCategory;
  Type: string;
  quantity: number;
  unit: string;
  qualityGrade?: string | null;
  notes?: string | null;
  userId?: number | null;
  saleItemId?: number | null;
}

export interface ProductionUpdateInput {
  farmId?: number;
  lotId?: number | null;
  animalId?: number | null;
  herdId?: number | null;
  penId?: number | null;
  date?: string | Date;
  Category?: ProductCategory;
  Type?: string;
  quantity?: number;
  unit?: string;
  qualityGrade?: string | null;
  notes?: string | null;
  userId?: number | null;
  saleItemId?: number | null;
}


