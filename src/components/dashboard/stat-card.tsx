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
    <div className="flex flex-1 flex-col gap-2 p-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <h3 className="font-medium">{title}</h3>
        <Eye className="size-4" />
      </div>
      <p
        className={cn(
          'font-headline text-2xl font-semibold text-foreground',
          className
        )}
      >
        {value}
      </p>
    </div>
  );
}
