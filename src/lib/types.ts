import type { QueryDocumentSnapshot } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  whatsapp?: string | null;
  role: 'admin' | 'user';
  planType: 'personal' | 'entrepreneur';
  initialBalance?: number;
  createdAt: string;
  subscriptionStatus: 'active' | 'inactive';
  subscriptionExpiresAt: string | null;
  subscriptionStartedAt: string | null;
  subscriptionSourceCode: string | null;
};

export type ActivationCode = {
  id: string;
  planType: 'personal' | 'entrepreneur';
  durationMonths: number;
  isUsed: boolean;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

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

export type GoalsSummary = {
  id: string;
  userId: string;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  goalsCount: number;
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
  spendingByCategory: { categoryId: string; amount: number }[];
  createdAt: string;
  updatedAt: string;
};

export type { QueryDocumentSnapshot };
