export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: Category;
  date: Date;
  paymentMethod: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
};
