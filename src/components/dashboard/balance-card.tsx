import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ArrowUp, Plus } from 'lucide-react';

type BalanceCardProps = {
  value: number;
  change: number;
};

export function BalanceCard({ value, change }: BalanceCardProps) {
  return (
    <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-90">Seu saldo este mês</p>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-full bg-white bg-opacity-20 text-primary-foreground hover:bg-white hover:bg-opacity-30"
        >
          <Plus className="mr-1 size-4" />
          Adicionar
        </Button>
      </div>
      <div className="mt-4">
        <p className="font-headline text-4xl font-bold">
          {formatCurrency(value)}
        </p>
        {change > 0 && (
          <div className="mt-1 flex items-center gap-1 text-sm font-medium text-green-300">
            <ArrowUp className="size-4" />
            <span>{formatCurrency(change)} na última semana</span>
          </div>
        )}
      </div>
    </div>
  );
}
