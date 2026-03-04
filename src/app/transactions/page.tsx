import { PageHeader } from '@/components/page-header';
import { transactions } from '@/lib/data';
import { iconMap } from '@/lib/icons';
import type { Transaction } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

function groupTransactionsByDay(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, transaction) => {
      const date = format(transaction.date, 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {} as Record<string, Transaction[]>
  );
}

export default function TransactionsPage() {
  const groupedTransactions = groupTransactionsByDay(
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Histórico" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Pesquisar transações..." className="pl-10" />
      </div>
      <div className="flex flex-col gap-6">
        {Object.entries(groupedTransactions).map(([date, transactions]) => {
          const displayDate = format(new Date(date), "d 'de' MMMM", {
            locale: ptBR,
          });
          return (
            <div key={date} className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                {displayDate}
              </h2>
              <div className="flex flex-col gap-2">
                {transactions.map((transaction) => {
                  const Icon = iconMap[transaction.category.icon];
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${transaction.category.color}20`,
                          }}
                        >
                          {Icon && (
                            <Icon
                              className="size-5"
                              style={{ color: transaction.category.color }}
                            />
                          )}
                        </div>
                        <span className="font-medium">
                          {transaction.description}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'font-bold',
                          transaction.type === 'income'
                            ? 'text-primary'
                            : 'text-destructive'
                        )}
                      >
                        {transaction.type === 'expense' && '- '}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
