'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { GoalsProgressCard } from '@/components/dashboard/setup-progress-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ChevronRight,
  Target,
  PlusCircle,
  PiggyBank,
  Trophy,
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
  Transaction,
  Category,
} from '@/lib/types';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AICategorizationCard } from '@/components/dashboard/ai-categorization-card';
import { MonthlyBalanceChart } from '@/components/dashboard/monthly-balance-chart';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const monthlySummariesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'monthlySummaries'),
      orderBy('id', 'desc'),
      limit(4)
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

  const recentTransactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc'),
      limit(5)
    );
  }, [firestore, user]);
  const { data: recentTransactions, isLoading: transactionsLoading } =
    useCollection<Transaction>(recentTransactionsQuery);

  const categoriesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'categories') : null,
    [firestore, user]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesQuery);

  const enrichedTransactions = useMemo(() => {
    if (!recentTransactions || !categories) return [];
    return recentTransactions.map((t) => ({
      ...t,
      category: categories.find((c) => c.id === t.categoryId),
    }));
  }, [recentTransactions, categories]);

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
      totalExpense: currentMonthSummary.totalExpense,
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

  const isLoading =
    summariesLoading ||
    goalsSummaryLoading ||
    firstGoalLoading ||
    transactionsLoading ||
    categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col p-0 md:flex-row md:items-center">
              <StatCard
                title="Balanço"
                value={formatCurrency(dashboardData.balance)}
              />
              <div className="w-full border-b md:hidden" />
              <div className="hidden h-12 border-l md:block" />
              <StatCard
                title="Receitas"
                value={formatCurrency(dashboardData.totalIncome)}
              />
              <div className="w-full border-b md:hidden" />
              <div className="hidden h-12 border-l md:block" />
              <StatCard
                title="Despesas"
                value={formatCurrency(dashboardData.totalExpenses)}
              />
            </CardContent>
          </Card>
          <MonthlyBalanceChart data={monthlySummaries || []} />
          <RecentTransactions transactions={enrichedTransactions} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <Button asChild size="sm" className="hidden w-full lg:flex">
            <Link href="/add-transaction">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Lançamento
            </Link>
          </Button>
          <GoalsProgressCard progressPercentage={goalsData.overallProgress} />

          {goalsSummary && goalsSummary.goalsCount > 0 ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="size-6 text-primary" />
                    <p className="font-semibold">Metas</p>
                  </div>
                </div>
                <p className="font-headline text-2xl font-bold">
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
                        <p className="font-semibold">
                          {goalsData.firstGoal.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Economize{' '}
                          {formatCurrency(goalsData.firstGoal.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </Link>
                )}

                <Button
                  asChild
                  variant="link"
                  className="mt-2 w-full px-0"
                >
                  <Link href="/goals">Ver todas as metas</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Target className="size-12 text-muted-foreground" />
              <h2 className="font-headline text-xl font-semibold">
                Crie sua primeira meta
              </h2>
              <p className="text-muted-foreground">
                Comece a planejar seu futuro financeiro criando sua primeira meta.
              </p>
              <Button asChild className="mt-4">
                <Link href="/goals/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Meta
                </Link>
              </Button>
            </Card>
          )}

          <AICategorizationCard />
        </div>
      </div>
    </div>
  );
}
