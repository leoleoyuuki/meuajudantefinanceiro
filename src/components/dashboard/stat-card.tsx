import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  className?: string;
};

export function StatCard({ title, value, className }: StatCardProps) {
  return (
    <div className={cn('flex flex-1 flex-col gap-2 p-6', className)}>
      <div className="flex items-center gap-2 text-sm text-primary">
        <h3 className="font-medium">{title}</h3>
        <Eye className="size-4 text-muted-foreground" />
      </div>
      <p className="font-headline text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}
