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
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection } from 'firebase/firestore';
import type { FinancialGoal } from '@/lib/types';
import { Loader2, PlusCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GoalsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const goalsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'financialGoals') : null,
    [firestore, user]
  );
  const { data: goals, isLoading } = useCollection<FinancialGoal>(goalsQuery);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Metas Financeiras">
        <Button asChild>
          <Link href="/goals/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Meta
          </Link>
        </Button>
      </PageHeader>

      {goals && goals.length > 0 ? (
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
                {goal.targetDate && (
                  <CardFooter className="flex justify-end text-xs text-muted-foreground">
                    <span>
                      Prazo: {format(new Date(goal.targetDate), 'dd/MM/yyyy')}
                    </span>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
          <Target className="size-12 text-muted-foreground" />
          <h2 className="font-headline text-xl font-semibold">
            Nenhuma meta criada
          </h2>
          <p className="text-muted-foreground">
            Comece a planejar seu futuro financeiro criando sua primeira meta.
          </p>
          <Button asChild className="mt-4">
            <Link href="/goals/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Primeira Meta
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
