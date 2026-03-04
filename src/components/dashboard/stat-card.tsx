import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: 'income' | 'expense' | 'balance';
};

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'balance',
}: StatCardProps) {
  const variantStyles = {
    balance: {
      iconContainer: 'bg-primary/10',
      icon: 'text-primary',
      value: 'text-foreground',
    },
    income: {
      iconContainer: 'bg-green-100 dark:bg-green-900/50',
      icon: 'text-green-600 dark:text-green-400',
      value: 'text-green-600 dark:text-green-400',
    },
    expense: {
      iconContainer: 'bg-destructive/10',
      icon: 'text-destructive',
      value: 'text-destructive',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-full',
            styles.iconContainer
          )}
        >
          <Icon className={cn('size-4', styles.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', styles.value)}>{value}</div>
      </CardContent>
    </Card>
  );
}
