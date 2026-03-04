'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { iconMap } from '@/lib/icons';
import type { Transaction } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '../ui/button';

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transações Recentes</CardTitle>
          <Button asChild variant="link">
            <Link href="/transactions">Ver todas</Link>
          </Button>
        </div>
        <CardDescription>
          Suas últimas 5 movimentações financeiras.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {transactions.map((transaction) => {
              const Icon =
                transaction.category && iconMap[transaction.category.icon];
              const color = transaction.category?.color || '#888';
              return (
                <div key={transaction.id} className="flex items-center gap-4">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${color}20`,
                    }}
                  >
                    {Icon && <Icon className="size-5" style={{ color }} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'font-bold',
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-destructive'
                    )}
                  >
                    {transaction.type === 'expense' && '- '}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma transação registrada ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
