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
  Eye,
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
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { MonthlyBalanceChart } from '@/components/dashboard/monthly-balance-chart';
import { CategorySpendingChart } from '@/components/dashboard/category-spending-chart';

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

  const dashboardData = useMemo(() => {
    const currentMonthSummary = monthlySummaries?.[0];
    if (
      !currentMonthSummary ||
      currentMonthSummary.id !== format(new Date(), 'yyyy-MM')
    ) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        invested: 0,
      };
    }
    return {
      totalIncome: currentMonthSummary.totalIncome,
      totalExpense: currentMonthSummary.totalExpense,
      balance: currentMonthSummary.netBalance,
      invested: currentMonthSummary.totalInvested || 0,
    };
  }, [monthlySummaries]);

  const categorySpendingData = useMemo(() => {
    if (!monthlySummaries || !categories) return [];

    const currentMonthSummary = monthlySummaries?.[0];
    if (
      !currentMonthSummary ||
      currentMonthSummary.id !== format(new Date(), 'yyyy-MM')
    ) {
      return [];
    }

    return (currentMonthSummary.spendingByCategory || [])
      .map((spending) => {
        const category = categories.find((c) => c.id === spending.categoryId);
        if (!category) return null;
        return {
          category: category.name,
          amount: spending.amount,
          fill: category.color,
        };
      })
      .filter(Boolean) as { category: string; amount: number; fill: string }[];
  }, [monthlySummaries, categories]);

  const isLoading =
    summariesLoading ||
    goalsSummaryLoading ||
    firstGoalLoading ||
    transactionsLoading ||
    categoriesLoading;

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const finalBalance = dashboardData.balance - dashboardData.invested;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">

          {/* ── MOBILE stats (hidden on md+) ── */}
          <div className="md:hidden overflow-hidden rounded-xl border border-border">
            {/* Hero balance */}
            <div
              className="relative overflow-hidden px-5 pt-5 pb-7"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)',
              }}
            >
              {/* Subtle grid texture overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 24px, currentColor 24px, currentColor 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, currentColor 24px, currentColor 25px)',
                }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground/60 mb-2">
                    Balanço do mês
                  </p>
                  <p
                    className={cn(
                      'font-headline text-[2.6rem] font-bold leading-none tracking-tight text-primary-foreground',
                      finalBalance < 0 && 'text-red-300'
                    )}
                  >
                    {formatCurrency(finalBalance)}
                  </p>
                </div>
                <Eye className="size-4 text-primary-foreground/40 mt-1" />
              </div>
            </div>

            {/* Three metrics row */}
            <div className="grid grid-cols-3 divide-x divide-border bg-card">
              <div className="px-3 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                  Receitas
                </p>
                <p className="text-sm font-bold text-primary leading-none">
                  {formatCurrency(dashboardData.totalIncome)}
                </p>
              </div>
              <div className="px-3 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                  Despesas
                </p>
                <p className="text-sm font-bold text-destructive leading-none">
                  {formatCurrency(dashboardData.totalExpense)}
                </p>
              </div>
              <div className="px-3 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                  Investido
                </p>
                <p className="text-sm font-bold text-chart-1 leading-none">
                  {formatCurrency(dashboardData.invested)}
                </p>
              </div>
            </div>
          </div>

          {/* ── DESKTOP stats card (hidden on mobile) — untouched ── */}
          <Card className="hidden md:block">
            <CardContent className="flex flex-col p-0 md:flex-row md:items-center">
              <StatCard
                title="Balanço"
                value={formatCurrency(finalBalance)}
                className={cn(finalBalance < 0 && 'text-destructive')}
              />
              <div className="mx-2 hidden h-10 w-[1px] bg-border md:block" />
              <div className="my-1 h-[1px] w-full bg-border md:hidden" />
              <StatCard
                title="Receitas"
                value={formatCurrency(dashboardData.totalIncome)}
                className="text-primary"
              />
              <div className="mx-2 hidden h-10 w-[1px] bg-border md:block" />
              <div className="my-1 h-[1px] w-full bg-border md:hidden" />
              <StatCard
                title="Despesas"
                value={formatCurrency(dashboardData.totalExpense)}
                className="text-destructive"
              />
              <div className="mx-2 hidden h-10 w-[1px] bg-border md:block" />
              <div className="my-1 h-[1px] w-full bg-border md:hidden" />
              <StatCard
                title="Valor Investido"
                value={formatCurrency(dashboardData.invested)}
                className="text-chart-1"
              />
            </CardContent>
          </Card>

          <MonthlyBalanceChart data={monthlySummaries || []} />
          <RecentTransactions transactions={enrichedTransactions} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <Button asChild className="hidden w-full lg:flex">
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

                <Button asChild variant="link" className="mt-2 w-full px-0">
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
                Comece a planejar seu futuro financeiro criando sua primeira
                meta.
              </p>
              <Button asChild className="mt-4">
                <Link href="/goals/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Meta
                </Link>
              </Button>
            </Card>
          )}
          <CategorySpendingChart data={categorySpendingData} />
        </div>
      </div>

      <Link href="/add-transaction">
        <Button
          className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full shadow-lg md:flex lg:hidden"
        >
          <PlusCircle className="h-7 w-7" />
          <span className="sr-only">Novo Lançamento</span>
        </Button>
      </Link>
    </div>
  );
}