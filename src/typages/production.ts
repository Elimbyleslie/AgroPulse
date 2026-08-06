import { ProductCategory } from "../../generated/prisma/enums.js";
import {SaleItem} from "../typages/expenseSale.js";

export interface ProductionCreateInput {
  farmId: number;
  lotId?: number | null;
  animalId?: number | null;
  herdId?: number | null;
  penId?: number | null;
  date?: string | Date;
  category: ProductCategory;
  type: string;
  quantity: number;
  unit: string;
  qualityGrade?: string | null;
  notes?: string | null;
  userId?: number | null;
  saleItems?: SaleItem[];
}

export interface ProductionUpdateInput {
  farmId?: number;
  lotId?: number | null;
  animalId?: number | null;
  herdId?: number | null;
  penId?: number | null;
  date?: string | Date;
  category?: ProductCategory;
  type?: string;
  quantity?: number;
  unit?: string;
  qualityGrade?: string | null;
  notes?: string | null;
  userId?: number | null;
  saleItems?: SaleItem[];
}


