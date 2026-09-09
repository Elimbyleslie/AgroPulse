import { Sale , Expense} from './expenseSale.js';


export enum PaymentMethod {
  cash = "cash",
  mobile_money = "mobile_money",
  bank_transfer = "bank_transfer",
  orange_money = "orange_money",
  check = "check",
  card = "card",
  other = "other",
}
export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL= "PARTIAL",
  COMPLETED= "COMPLETED",
  FAILED= "FAILED",
  CANCELLED= "CANCELLED",
  REFUNDED= "REFUNDED"
}

export interface Payment {
  id: number;
  farmId: number;
  saleId?: number | null;
  purchaseId?: number | null;
  expenseId?: number | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  recordedById?: number | null;
  createdAt: string;
  updatedAt: string;

  farm?: any;
  sale?: Sale | null;
  purchase?: any | null;
  expense?: Expense | null;
  recordedBy?: { id: number; name?: string } | null;
}


export type CreatePaymentPayload = {
  farmId: number;
  saleId?: number | null;
  purchaseId?: number | null;
  expenseId?: number | null;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
};

