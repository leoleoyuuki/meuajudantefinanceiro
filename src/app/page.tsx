import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ArrowDown, ArrowUp, PiggyBank, Scale } from 'lucide-react';
import { CategorySpendingChart } from '@/components/dashboard/category-spending-chart';
import { TopExpenses } from '@/components/dashboard/top-expenses';
import { getDashboardData } from '@/lib/data';

export default function DashboardPage() {
  const {
    currentBalance,
    totalIncome,
    totalExpenses,
    spendingByCategory,
    topExpenses,
  } = getDashboardData();
  const savings = totalIncome - totalExpenses;

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
