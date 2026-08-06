
export enum PaymentMethod {
  card = "card",
  mobile_money = "mobile_money",
  orange_money = "orange_money",
  paypal = "paypal",
  cash = "cash",
  others = "others",
}
export interface Payment {
  id: number;
  organizationId: number;
  farmerId?: number;
  purchaseId?: number;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference: string;
  description?: string;
  userId?: number;
  saleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum PaymentStatus  {
  PENDING= 'PENDING',
  SUCCESS= 'SUCCESS',
  FAILED= 'FAILED',
  CANCELLED= 'CANCELLED',
  REFUNDED= 'REFUNDED'
} 
