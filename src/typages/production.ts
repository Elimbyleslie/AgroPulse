export interface Production {
  id?: number;
  lotId?: number;
  date?: string; // ISO string
  productType: string;
  quantity: number;
  unit: string;
  qualityGrade?: string;
  notes?: string;
  userId?: number;
  saleItemId?: number;
}
