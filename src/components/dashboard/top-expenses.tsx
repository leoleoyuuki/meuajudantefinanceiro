import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { iconMap } from '@/lib/icons';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';

type TopExpensesProps = {
  data: Transaction[];
};

export function TopExpenses({ data }: TopExpensesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maiores despesas do mês</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex flex-col gap-4">
            {data.map((transaction) => {
              const Icon = iconMap[transaction.category.icon];
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${transaction.category.color}20` }}
                    >
                      {Icon && (
                        <Icon
                          className="size-5"
                          style={{ color: transaction.category.color }}
                        />
                      )}
                    </div>
                    <span className="font-medium">{transaction.description}</span>
                  </div>
                  <span className="font-bold text-destructive">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma despesa registrada este mês.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
