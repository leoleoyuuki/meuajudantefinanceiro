import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function SetupProgressCard() {
  return (
    <Link href="#">
      <Card className="flex items-center justify-between p-4 transition-shadow hover:shadow-md bg-card">
        <div className="flex items-center gap-4">
          <div className="relative size-10">
            <svg className="size-full" width="36" height="36" viewBox="0 0 36 36">
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
                strokeDasharray="100.53"
                strokeDashoffset="60.318" // 100.53 * (1 - 0.4)
                strokeLinecap="round"
                fill="none"
                cx="18"
                cy="18"
                r="16"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-primary">Complete seu cadastro</p>
            <p className="text-sm text-muted-foreground">2 de 5 passos completos</p>
          </div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" />
      </Card>
    </Link>
  );
}
