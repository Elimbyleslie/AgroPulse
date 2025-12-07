// typages/expense.ts
export interface Expense {
  id?: number;
  farmId: number;
  categoryId?: number;
  amount: number;
  date: string;
  notes?: string;
}

// typages/expenseCategory.ts
export interface ExpenseCategory {
  id?: number;
  name: string;
}

// typages/sale.ts
export interface Sale {
  id?: number;
  farmId: number;
  date: string;
  total: number;
  notes?: string;
}

// typages/saleItem.ts
export interface SaleItem {
  id?: number;
  saleId: number;
  lotId?: number;
  animalId?: number;
  quantity: number;
  price: number;
}
