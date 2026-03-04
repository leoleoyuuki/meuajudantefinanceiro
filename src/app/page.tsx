'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ArrowDown, ArrowUp, PiggyBank, Scale, Loader2 } from 'lucide-react';
import { CategorySpendingChart } from '@/components/dashboard/category-spending-chart';
import { TopExpenses } from '@/components/dashboard/top-expenses';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction, Category } from '@/lib/types';
import { useMemo } from 'react';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const transactionsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'transactions') : null,
    [firestore, user]
  );
  const { data: transactions, isLoading: transactionsLoading } =
    useCollection<Transaction>(transactionsQuery);

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesQuery);

  const dashboardData = useMemo(() => {
    if (!transactions || !categories) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        currentBalance: 0,
        spendingByCategory: [],
        topExpenses: [],
      };
    }

    const now = new Date();
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    });

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const currentBalance = transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    const spendingByCategory = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          const category = categories.find((c) => c.id === t.categoryId);
          if (!category) return acc;

          const existing = acc.find((item) => item.category === category.name);
          if (existing) {
            existing.amount += t.amount;
          } else {
            acc.push({
              category: category.name,
              amount: t.amount,
              fill: category.color,
            });
          }
          return acc;
        },
        [] as { category: string; amount: number; fill: string }[]
      );

    const topExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .map((t) => ({
        ...t,
        category: categories.find((c) => c.id === t.categoryId)!,
      }));

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      spendingByCategory,
      topExpenses,
    };
  }, [transactions, categories]);

  const {
    currentBalance,
    totalIncome,
    totalExpenses,
    spendingByCategory,
    topExpenses,
  } = dashboardData;
  const savings = totalIncome - totalExpenses;

  const isLoading = transactionsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <DashboardHeader />

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="Saldo Atual"
          value={currentBalance}
          icon={Scale}
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
        />
        <SummaryCard
          title="Economia do Mês"
          value={savings}
          icon={PiggyBank}
          iconClass="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="Receitas do Mês"
          value={totalIncome}
          icon={ArrowUp}
          variant="small"
          iconClass="text-primary"
        />
        <SummaryCard
          title="Despesas do Mês"
          value={totalExpenses}
          icon={ArrowDown}
          variant="small"
          iconClass="text-destructive"
        />
      </div>

      <div className="flex flex-col gap-6">
        <CategorySpendingChart data={spendingByCategory} />
        <TopExpenses data={topExpenses} />
      </div>
    </div>
  );
}
