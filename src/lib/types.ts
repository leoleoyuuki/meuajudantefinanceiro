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

export type Goal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
};
