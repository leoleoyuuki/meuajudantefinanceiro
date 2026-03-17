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
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  doc,
  increment,
  getDoc,
  getDocs,
  query,
  writeBatch,
} from 'firebase/firestore';
import type {
  FinancialGoal,
  MonthlySummary,
  Category,
  Transaction,
} from '@/lib/types';
import { Loader2, PlusCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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

  const [goals, setGoals] = useState<FinancialGoal[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const goalsQuery = query(
          collection(firestore, 'users', user.uid, 'financialGoals')
        );
        const categoriesQuery = query(
          collection(firestore, 'users', user.uid, 'categories')
        );

        const [goalsSnapshot, categoriesSnapshot] = await Promise.all([
          getDocs(goalsQuery),
          getDocs(categoriesQuery),
        ]);

        const fetchedGoals = goalsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FinancialGoal[];
        setGoals(fetchedGoals);

        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching financial goals or categories: ', error);
        setGoals([]);
        setCategories([]);
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar dados',
          description: 'Não foi possível carregar suas metas ou categorias.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, firestore, toast]);

  const handleAddAmount = async () => {
    if (!selectedGoal || !firestore || !user || !goals || !categories) return;
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

    const investmentCategory = categories.find(
      (c) => c.name === 'Investimentos' && c.type === 'expense'
    );
    if (!investmentCategory) {
      toast({
        title: 'Categoria não encontrada',
        description:
          'A categoria "Investimentos" não foi encontrada. Não foi possível registrar a movimentação.',
        variant: 'destructive',
      });
      return;
    }

    // Optimistically update the UI
    const originalGoals = goals;
    const updatedGoals = goals.map((goal) =>
      goal.id === selectedGoal.id
        ? {
            ...goal,
            currentAmount: newCurrentAmount,
            updatedAt: new Date().toISOString(),
          }
        : goal
    );
    setGoals(updatedGoals);

    const now = new Date();
    const batch = writeBatch(firestore);

    // 1. Update the financial goal document
    const goalRef = doc(
      firestore,
      'users',
      user.uid,
      'financialGoals',
      selectedGoal.id
    );
    batch.update(goalRef, {
      currentAmount: newCurrentAmount,
      updatedAt: now.toISOString(),
    });

    // 2. Create a new transaction for the investment
    const transactionRef = doc(
      collection(firestore, 'users', user.uid, 'transactions')
    );
    const transactionData: Omit<Transaction, 'category'> = {
      id: transactionRef.id,
      userId: user.uid,
      amount: numericAmount,
      type: 'expense',
      description: `Aplicação na meta: ${selectedGoal.name}`,
      categoryId: investmentCategory.id,
      date: now.toISOString(),
      paymentMethod: 'Aplicação em Meta',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    batch.set(transactionRef, transactionData);

    // 3. Update all-time goals summary
    const summaryRef = doc(
      firestore,
      'users',
      user.uid,
      'goalsSummaries',
      'summary'
    );
    batch.update(summaryRef, {
      totalCurrentAmount: increment(numericAmount),
      updatedAt: now.toISOString(),
    });

    // 4. Update monthly summary
    const monthlySummaryId = format(now, 'yyyy-MM');
    const monthlySummaryRef = doc(
      firestore,
      'users',
      user.uid,
      'monthlySummaries',
      monthlySummaryId
    );

    try {
      const monthlySummarySnap = await getDoc(monthlySummaryRef);

      if (monthlySummarySnap.exists()) {
        const summaryData = monthlySummarySnap.data() as MonthlySummary;
        const newSpendingByCategory = [...(summaryData.spendingByCategory || [])];
        const categoryIndex = newSpendingByCategory.findIndex(
          (item) => item.categoryId === investmentCategory.id
        );

        if (categoryIndex > -1) {
          newSpendingByCategory[categoryIndex].amount += numericAmount;
        } else {
          newSpendingByCategory.push({
            categoryId: investmentCategory.id,
            amount: numericAmount,
          });
        }

        batch.update(monthlySummaryRef, {
          totalExpense: increment(numericAmount),
          netBalance: increment(-numericAmount),
          spendingByCategory: newSpendingByCategory,
          updatedAt: now.toISOString(),
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
          totalExpense: numericAmount,
          netBalance: -numericAmount,
          spendingByCategory: [
            { categoryId: investmentCategory.id, amount: numericAmount },
          ],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        batch.set(monthlySummaryRef, newSummary);
      }

      await batch.commit();
    } catch (error) {
      console.error('Failed to update summaries and commit batch:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao registrar o investimento.',
        variant: 'destructive',
      });
      // Revert optimistic UI update
      setGoals(originalGoals);
      return;
    }

    toast({
      title: 'Valor adicionado!',
      description: `${formatCurrency(numericAmount)} adicionado à meta "${
        selectedGoal.name
      }".`,
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
