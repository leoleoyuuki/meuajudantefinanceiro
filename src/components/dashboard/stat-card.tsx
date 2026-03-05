'use client';

import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  className?: string;
};

export function StatCard({ title, value, className }: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-1 p-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <h3 className="font-medium">{title}</h3>
        <Eye className="size-4" />
      </div>
      <p
        className={cn(
          'font-headline text-lg font-semibold text-foreground',
          className
        )}
      >
        {value}
      </p>
    </div>
  );
}
