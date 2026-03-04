import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type SummaryCardProps = {
  title: string;
  value: number;
  icon?: LucideIcon;
  variant?: 'default' | 'small' | 'primary';
  iconClass?: string;
};

export function SummaryCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  iconClass,
}: SummaryCardProps) {
  if (variant === 'primary') {
    return (
      <Card className={cn('bg-primary text-primary-foreground shadow-lg')}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-normal">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-headline text-4xl font-bold">
            {formatCurrency(value)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'small') {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && (
            <Icon className={cn('h-4 w-4 text-muted-foreground', iconClass)} />
          )}
        </CardHeader>
        <CardContent>
          <div className="font-headline text-2xl font-bold">
            {formatCurrency(value)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <div
            className={cn(
              'flex size-7 items-center justify-center rounded-full',
              iconClass
            )}
          >
            <Icon className="h-4 w-4 text-current" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="font-headline text-3xl font-bold">
          {formatCurrency(value)}
        </div>
      </CardContent>
    </Card>
  );
}
