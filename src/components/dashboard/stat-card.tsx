'use client';

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: number;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  className?: string;
};

export function StatCard({
  title,
  value,
  isBalanceVisible,
  toggleBalanceVisibility,
  className,
}: StatCardProps) {
  const displayValue = isBalanceVisible ? formatCurrency(value) : 'R$ ●●●●●';

  return (
    <div className="flex flex-1 flex-col gap-1 p-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <h3 className="font-medium">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-0"
          onClick={toggleBalanceVisibility}
        >
          {isBalanceVisible ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </Button>
      </div>
      <p
        className={cn(
          'font-headline text-lg font-semibold text-foreground',
          className
        )}
      >
        {displayValue}
      </p>
    </div>
  );
}
