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
  updateDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import type { FinancialGoal, MonthlySummary } from '@/lib/types';
import { Loader2, PlusCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function GoalsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const goalsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'financialGoals') : null,
    [firestore, user]
  );
  const { data: goals, isLoading } = useCollection<FinancialGoal>(goalsQuery);

  const handleAddAmount = async () => {
    if (!selectedGoal || !firestore || !user) return;
    const numericAmount = parseFloat(amountToAdd);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Por favor, insira um número positivo.',
        variant: 'destructive',
      });
      return;
    }

    const newCurrentAmount = selectedGoal.currentAmount + numericAmount;

    if (newCurrentAmount > selectedGoal.targetAmount) {
      toast({
        title: 'Valor excede a meta',
        description: 'O valor adicionado ultrapassa o total da meta.',
        variant: 'destructive',
      });
      return;
    }

    const goalRef = doc(
      firestore,
      'users',
      user.uid,
      'financialGoals',
      selectedGoal.id
    );
    const now = new Date();
    const nowISO = now.toISOString();

    updateDocumentNonBlocking(goalRef, {
      currentAmount: newCurrentAmount,
      updatedAt: nowISO,
    });

    try {
      // Update all-time goals summary
      const summaryRef = doc(
        firestore,
        'users',
        user.uid,
        'goalsSummaries',
        'summary'
      );
      await updateDoc(summaryRef, {
        totalCurrentAmount: increment(numericAmount),
        updatedAt: nowISO,
      });

      // Update monthly summary for investments
      const monthlySummaryId = format(now, 'yyyy-MM');
      const monthlySummaryRef = doc(
        firestore,
        'users',
        user.uid,
        'monthlySummaries',
        monthlySummaryId
      );
      const monthlySummarySnap = await getDoc(monthlySummaryRef);

      if (monthlySummarySnap.exists()) {
        await updateDoc(monthlySummaryRef, {
          totalInvested: increment(numericAmount),
          updatedAt: nowISO,
        });
      } else {
        const month = parseInt(format(now, 'M'));
        const year = parseInt(format(now, 'yyyy'));
        const newSummary: MonthlySummary = {
          id: monthlySummaryId,
          userId: user.uid,
          month,
          year,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          spendingByCategory: [],
          totalInvested: numericAmount,
          createdAt: nowISO,
          updatedAt: nowISO,
        };
        await setDoc(monthlySummaryRef, newSummary);
      }
    } catch (error) {
      console.error('Failed to update summaries:', error);
    }

    toast({
      title: 'Valor adicionado!',
      description: `${formatCurrency(
        numericAmount
      )} adicionado à meta "${selectedGoal.name}".`,
    });

    setIsDialogOpen(false);
    setAmountToAdd('');
    setSelectedGoal(null);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setAmountToAdd('');
      setSelectedGoal(null);
    }
    setIsDialogOpen(open);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Metas Financeiras">
        <Button asChild>
          <Link href="/goals/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Meta
          </Link>
        </Button>
      </PageHeader>

      {goals && goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsDialogOpen(true);
                      }}
                      disabled={goal.currentAmount >= goal.targetAmount}
                    >
                      {goal.currentAmount >= goal.targetAmount
                        ? 'Meta Atingida!'
                        : 'Adicionar Valor'}
                    </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar valor para "{selectedGoal?.name}"
            </DialogTitle>
            <DialogDescription>
              O valor atual é de{' '}
              {formatCurrency(selectedGoal?.currentAmount ?? 0)}. Quanto você
              gostaria de adicionar?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                placeholder="0,00"
                className="pl-10 text-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAmount}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
