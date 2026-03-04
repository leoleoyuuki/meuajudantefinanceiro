'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Goal } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function GoalsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const goalsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'financialGoals') : null,
    [firestore, user]
  );
  const { data: goals, isLoading } = useCollection<Goal>(goalsQuery);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Metas Financeiras" />
      <div className="grid gap-6 md:grid-cols-2">
        {goals?.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle>{goal.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold text-primary">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} />
                <div className="flex justify-between pt-2 text-xs text-muted-foreground">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end text-xs text-muted-foreground">
                <span>
                  Prazo: {format(new Date(goal.deadline), 'dd/MM/yyyy')}
                </span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
