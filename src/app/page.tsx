'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { GoalsProgressCard } from '@/components/dashboard/setup-progress-card';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  Wallet,
  TrendingUp,
  Shield,
  CreditCard,
  PiggyBank,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Transaction, FinancialGoal } from '@/lib/types';
import { useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc'),
      where('date', '>=', startDate.toISOString()),
      where('date', '<=', endDate.toISOString())
    );
  }, [firestore, user]);

  const { data: transactions, isLoading: transactionsLoading } =
    useCollection<Transaction>(transactionsQuery);

  const goalsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'financialGoals') : null,
    [firestore, user]
  );
  const { data: goals, isLoading: goalsLoading } =
    useCollection<FinancialGoal>(goalsQuery);

  const dashboardData = useMemo(() => {
    if (!transactions) {
      return { totalIncome: 0, totalExpenses: 0 };
    }
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return { totalIncome, totalExpenses };
  }, [transactions]);

  const goalsData = useMemo(() => {
    if (!goals || goals.length === 0) {
      return { totalSaved: 0, firstGoal: null, overallProgress: 0 };
    }
    const totalSaved = goals.reduce(
      (acc, goal) => acc + goal.currentAmount,
      0
    );
    const totalTarget = goals.reduce(
      (acc, goal) => acc + goal.targetAmount,
      0
    );
    const overallProgress =
      totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return { totalSaved, firstGoal: goals[0], overallProgress };
  }, [goals]);

  const { totalIncome, totalExpenses } = dashboardData;
  const balance = totalIncome - totalExpenses;

  const isLoading = transactionsLoading || goalsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const showGoalsProgress = goals && goals.length > 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <DashboardHeader />

      <BalanceCard value={balance} change={23.91} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-md">
          <Wallet className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Receitas</p>
            <p className="text-base font-semibold">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </Card>
        <Card className="flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-md">
          <TrendingUp className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Despesas</p>
            <p className="text-base font-semibold">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </Card>
        <Card className="flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-md">
          <Shield className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Pensões</p>
            <p className="text-base font-semibold text-muted-foreground">
              Em breve
            </p>
          </div>
        </Card>
        <Card className="flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-md">
          <CreditCard className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Cartão</p>
            <p className="text-base font-semibold text-muted-foreground">
              Em breve
            </p>
          </div>
        </Card>
      </div>

      {showGoalsProgress && (
        <GoalsProgressCard progressPercentage={goalsData.overallProgress} />
      )}

      {goals && goals.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PiggyBank className="size-6 text-primary" />
              <p className="font-semibold">Metas</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Próximo depósito aqui
            </p>
          </div>
          <p className="mt-2 font-headline text-2xl font-bold">
            {formatCurrency(goalsData.totalSaved)}
          </p>
          <p className="text-xs text-muted-foreground">Desde sempre</p>

          <hr className="my-4" />

          {goalsData.firstGoal && (
            <Link
              href={`/goals`}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                  <Trophy className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{goalsData.firstGoal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Economize {formatCurrency(goalsData.firstGoal.targetAmount)}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          )}

          <Link
            href="/goals"
            className="mt-4 block w-full text-center text-sm font-semibold text-primary"
          >
            Ver todas as metas
          </Link>
        </Card>
      )}
    </div>
  );
}
