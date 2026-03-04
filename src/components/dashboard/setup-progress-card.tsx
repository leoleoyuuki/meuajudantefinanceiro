import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type GoalsProgressCardProps = {
  completedGoals: number;
  totalGoals: number;
};

export function GoalsProgressCard({
  completedGoals,
  totalGoals,
}: GoalsProgressCardProps) {
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  const circumference = 100.53; // 2 * PI * 16
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <Link href="/goals">
      <Card className="flex items-center justify-between p-4 transition-shadow hover:shadow-md bg-card">
        <div className="flex items-center gap-4">
          <div className="relative size-10">
            <svg
              className="size-full"
              width="36"
              height="36"
              viewBox="0 0 36 36"
            >
              <circle
                className="stroke-current text-secondary"
                strokeWidth="3"
                fill="none"
                cx="18"
                cy="18"
                r="16"
              />
              <circle
                className="origin-center -rotate-90 stroke-current text-primary"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                cx="18"
                cy="18"
                r="16"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-primary">Progresso das Metas</p>
            <p className="text-sm text-muted-foreground">
              {completedGoals} de {totalGoals} metas completas
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" />
      </Card>
    </Link>
  );
}
