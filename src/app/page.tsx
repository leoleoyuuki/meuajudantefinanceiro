'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { GoalsProgressCard } from '@/components/dashboard/setup-progress-card';
import { MonthlyBalanceChart } from '@/components/dashboard/monthly-balance-chart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Wallet,
  TrendingDown,
  FileClock,
  Repeat,
  PiggyBank,
  Trophy,
  ChevronRight,
  Target,
  PlusCircle,
} from 'lucide-react';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  useDoc,
} from '@/firebase';
import { collection, doc, query, limit, orderBy } from 'firebase/firestore';
import type {
  FinancialGoal,
  MonthlySummary,
  GoalsSummary,
} from '@/lib/types';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const monthlySummariesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'monthlySummaries'),
      orderBy('id', 'desc'),
      limit(6)
    );
  }, [firestore, user]);
  const { data: monthlySummaries, isLoading: summariesLoading } =
    useCollection<MonthlySummary>(monthlySummariesQuery);

  const goalsSummaryQuery = useMemoFirebase(
    () =>
      user
        ? doc(firestore, 'users', user.uid, 'goalsSummaries', 'summary')
        : null,
    [firestore, user]
  );
  const { data: goalsSummary, isLoading: goalsSummaryLoading } =
    useDoc<GoalsSummary>(goalsSummaryQuery);

  const firstGoalQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'financialGoals'),
            limit(1)
          )
        : null,
    [firestore, user]
  );
  const { data: firstGoalArr, isLoading: firstGoalLoading } =
    useCollection<FinancialGoal>(firstGoalQuery);

  const dashboardData = useMemo(() => {
    const currentMonthSummary = monthlySummaries?.[0];
    if (
      !currentMonthSummary ||
      currentMonthSummary.id !== format(new Date(), 'yyyy-MM')
    ) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }
    return {
      totalIncome: currentMonthSummary.totalIncome,
      totalExpenses: currentMonthSummary.totalExpense,
      balance: currentMonthSummary.netBalance,
    };
  }, [monthlySummaries]);

  const goalsData = useMemo(() => {
    if (!goalsSummary || goalsSummary.goalsCount === 0) {
      return {
        totalSaved: 0,
        firstGoal: null,
        overallProgress: 0,
      };
    }

    const totalSaved = goalsSummary.totalCurrentAmount;
    const totalTarget = goalsSummary.totalTargetAmount;
    const overallProgress =
      totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const firstGoal = firstGoalArr?.[0] || null;

    return { totalSaved, firstGoal, overallProgress };
  }, [goalsSummary, firstGoalArr]);

  const { totalIncome, totalExpenses, balance } = dashboardData;

  const isLoading = summariesLoading || goalsSummaryLoading || firstGoalLoading;

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

      <BalanceCard value={balance} />

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
          <TrendingDown className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Despesas</p>
            <p className="text-base font-semibold">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </Card>
        <Card className="flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-md">
          <FileClock className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Contas fixas</p>
            <p className="text-base font-semibold text-muted-foreground">
              Em breve
            </p>
          </div>
        </Card>
        <Card className="flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-md">
          <Repeat className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Ganhos fixos</p>
            <p className="text-base font-semibold text-muted-foreground">
              Em breve
            </p>
          </div>
        </Card>
      </div>

      <MonthlyBalanceChart data={monthlySummaries || []} />

      <GoalsProgressCard progressPercentage={goalsData.overallProgress} />

      {goalsSummary && goalsSummary.goalsCount > 0 ? (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PiggyBank className="size-6 text-primary" />
              <p className="font-semibold">Metas</p>
            </div>
            <Link
              href="/goals"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Próximo depósito aqui
            </Link>
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
                    Economize{' '}
                    {formatCurrency(goalsData.firstGoal.targetAmount)}
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
      ) : (
        <Card className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Target className="size-12 text-muted-foreground" />
          <h2 className="font-headline text-xl font-semibold">
            Crie sua primeira meta
          </h2>
          <p className="text-muted-foreground">
            Comece a planejar seu futuro financeiro.
          </p>
          <Button asChild className="mt-4">
            <Link href="/goals/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Meta
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
