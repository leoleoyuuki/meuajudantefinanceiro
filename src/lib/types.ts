export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  categoryId: string;
  category?: Category;
  date: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt: string;
};

export type FinancialGoal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type MonthlySummary = {
  id: string;
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  spendingByCategory: any[];
  createdAt: string;
  updatedAt: string;
};
