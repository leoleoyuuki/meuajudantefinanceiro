import type { Transaction, Category, Goal } from '@/lib/types';
import { subMonths, subDays } from 'date-fns';

export const categories: Category[] = [
  { id: '1', name: 'Alimentação', icon: 'Utensils', color: 'hsl(var(--chart-1))' },
  { id: '2', name: 'Transporte', icon: 'Car', color: 'hsl(var(--chart-2))' },
  { id: '3', name: 'Moradia', icon: 'Home', color: 'hsl(var(--chart-3))' },
  { id: '4', name: 'Lazer', icon: 'Film', color: 'hsl(var(--chart-4))' },
  { id: '5', name: 'Assinaturas', icon: 'Repeat', color: 'hsl(var(--chart-5))' },
  { id: '6', name: 'Salário', icon: 'Landmark', color: 'hsl(var(--primary))' },
];

export const transactions: Transaction[] = [
  { id: '1', amount: 3500, type: 'income', description: 'Salário Mensal', category: categories[5], date: subDays(new Date(), 25), paymentMethod: 'PIX' },
  { id: '2', amount: 55.9, type: 'expense', description: 'iFood', category: categories[0], date: subDays(new Date(), 2), paymentMethod: 'Crédito' },
  { id: '3', amount: 150, type: 'expense', description: 'Uber', category: categories[1], date: subDays(new Date(), 5), paymentMethod: 'Crédito' },
  { id: '4', amount: 1200, type: 'expense', description: 'Aluguel', category: categories[2], date: subDays(new Date(), 20), paymentMethod: 'Boleto' },
  { id: '5', amount: 75, type: 'expense', description: 'Cinema', category: categories[3], date: subDays(new Date(), 10), paymentMethod: 'Débito' },
  { id: '6', amount: 39.9, type: 'expense', description: 'Netflix', category: categories[4], date: subDays(new Date(), 15), paymentMethod: 'Crédito' },
  { id: '7', amount: 25.5, type: 'expense', description: 'Padaria', category: categories[0], date: subDays(new Date(), 1), paymentMethod: 'Débito' },
  { id: '8', amount: 250, type: 'income', description: 'Freela', category: categories[5], date: subDays(new Date(), 8), paymentMethod: 'PIX' },
  { id: '9', amount: 180.75, type: 'expense', description: 'Supermercado', category: categories[0], date: subDays(new Date(), 12), paymentMethod: 'Crédito' },
  { id: '10', amount: 45, type: 'expense', description: 'Gasolina', category: categories[1], date: subDays(new Date(), 3), paymentMethod: 'Crédito' },
];

export const goals: Goal[] = [
    { id: '1', name: 'Viagem para o Japão', targetAmount: 20000, currentAmount: 7500, deadline: new Date('2025-12-31') },
    { id: '2', name: 'Reserva de Emergência', targetAmount: 15000, currentAmount: 14000, deadline: new Date('2024-12-31') },
    { id: '3', name: 'Novo Computador', targetAmount: 8000, currentAmount: 2500, deadline: new Date('2024-10-30') },
];

export function getDashboardData() {
  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear());

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const spendingByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const categoryName = t.category.name;
      const existing = acc.find(item => item.category === categoryName);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ category: categoryName, amount: t.amount, fill: t.category.color });
      }
      return acc;
    }, [] as { category: string; amount: number; fill: string }[]);

  const topExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  
  return {
    totalIncome,
    totalExpenses,
    currentBalance,
    spendingByCategory,
    topExpenses
  };
}
