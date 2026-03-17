import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type GoalsProgressCardProps = {
  progressPercentage: number;
  isBalanceVisible: boolean;
};

export function GoalsProgressCard({
  progressPercentage,
  isBalanceVisible,
}: GoalsProgressCardProps) {
  const progress = progressPercentage > 100 ? 100 : progressPercentage;
  const circumference = 100.53; // 2 * PI * 16
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <Link href="/goals">
      <Card className="flex h-full items-center justify-between bg-card p-4 transition-shadow hover:shadow-md">
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
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {isBalanceVisible ? `${Math.floor(progress)}%` : '●●%'}
              </span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-primary">Progresso das Metas</p>
            <p className="text-sm text-muted-foreground">
              {isBalanceVisible
                ? `Total de ${progress.toFixed(2).replace('.', ',')}% alcançado`
                : 'Progresso oculto'}
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" />
      </Card>
    </Link>
  );
}
