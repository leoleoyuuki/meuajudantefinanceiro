'use client';

import { PageHeader } from '@/components/page-header';
import { iconMap } from '@/lib/icons';
import type { Transaction, Category, MonthlySummary } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Loader2,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CategorySpendingChart } from '@/components/dashboard/category-spending-chart';
import { getExpenseAnalysis } from '@/app/actions';
import type { SuggestExpenseAnalysisOutput } from '@/ai/flows/suggest-expense-analysis';

// Based on common financial advice (50/30/20 rule adjusted)
const idealPercentages: { [key: string]: number } = {
  Moradia: 35,
  Transporte: 15,
  Alimentação: 15,
  Saúde: 5,
  Lazer: 10,
  Educação: 5,
  Compras: 5,
  Assinaturas: 5,
  Outros: 5,
};

const statusConfig = {
  good: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  over: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
};

function groupTransactionsByDay(transactions: Transaction[]) {
  if (!transactions) return {};
  return transactions.reduce(
    (acc, transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {} as Record<string, Transaction[]>
  );
}

export default function TransactionsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [analysis, setAnalysis] = useState<SuggestExpenseAnalysisOutput | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const summariesQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'monthlySummaries'),
            orderBy('id', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: summaries, isLoading: summariesLoading } =
    useCollection<MonthlySummary>(summariesQuery);

  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    if (summaries && summaries.length > 0 && !selectedMonth) {
      setSelectedMonth(summaries[0].id);
    }
  }, [summaries, selectedMonth]);

  const allTransactionsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'transactions'),
            orderBy('date', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: allTransactions, isLoading: transactionsLoading } =
    useCollection<Transaction>(allTransactionsQuery);

  const categoriesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'categories') : null,
    [firestore, user]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesQuery);

  const selectedSummary = useMemo(() => {
    return summaries?.find((s) => s.id === selectedMonth);
  }, [selectedMonth, summaries]);

  const categorySpendingData = useMemo(() => {
    if (!selectedSummary || !categories) return [];
    return (selectedSummary.spendingByCategory || [])
      .map((spending) => {
        const category = categories.find((c) => c.id === spending.categoryId);
        if (!category) return null;
        return {
          category: category.name,
          amount: spending.amount,
          fill: category.color,
        };
      })
      .filter(Boolean) as { category: string; amount: number; fill: string }[];
  }, [selectedSummary, categories]);

  useEffect(() => {
    if (!selectedSummary) {
      setAnalysis(null);
      return;
    }
    const runAnalysis = async () => {
      setIsAnalysisLoading(true);
      setAnalysis(null);
      try {
        const spendingByCategoryForAI = categorySpendingData.map((item) => ({
          categoryName: item.category,
          spentAmount: item.amount,
          idealPercentage: idealPercentages[item.category] || 5,
        }));
        const result = await getExpenseAnalysis({
          totalIncome: selectedSummary.totalIncome,
          spendingByCategory: spendingByCategoryForAI,
        });
        setAnalysis(result);
      } catch (error) {
        console.error('Error fetching expense analysis:', error);
      } finally {
        setIsAnalysisLoading(false);
      }
    };
    runAnalysis();
  }, [selectedSummary, categorySpendingData]);

  const transactionsForMonth = useMemo(() => {
    if (!allTransactions || !selectedMonth) return [];
    return allTransactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [allTransactions, selectedMonth]);

  const enrichedTransactions = useMemo(() => {
    if (!transactionsForMonth || !categories) return [];
    return transactionsForMonth.map((t) => ({
      ...t,
      category: categories.find((c) => c.id === t.categoryId),
    }));
  }, [transactionsForMonth, categories]);

  const filteredTransactions = useMemo(() => {
    if (!enrichedTransactions) return [];
    if (!searchTerm) return enrichedTransactions;
    return enrichedTransactions.filter(
      (t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedTransactions, searchTerm]);

  const groupedTransactions = groupTransactionsByDay(filteredTransactions);
  const isLoading = summariesLoading || transactionsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Histórico e Análise" />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <CardTitle>Análise de Despesas</CardTitle>
              <CardDescription>
                Veja seus gastos por categoria e receba dicas da nossa IA.
              </CardDescription>
            </div>
            {summaries && summaries.length > 0 && (
              <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {summaries.map((summary) => (
                    <SelectItem key={summary.id} value={summary.id}>
                      {format(new Date(summary.id + '-02'), 'MMMM yyyy', {
                        locale: ptBR,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 lg:grid-cols-2">
            <CategorySpendingChart data={categorySpendingData} />
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-lg border bg-accent/50 p-4">
                <Lightbulb className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">Análise da IA</h3>
                  {isAnalysisLoading && (
                    <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Analisando seus gastos...</span>
                    </div>
                  )}
                  {analysis && (
                    <p className="pt-1 text-sm text-muted-foreground">
                      {analysis.summary}
                    </p>
                  )}
                </div>
              </div>

              {analysis && analysis.analysis.length > 0 && (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full rounded-lg border px-4"
                >
                  {analysis.analysis.map((item, index) => {
                    const status = statusConfig[item.status];
                    const Icon = status.icon;
                    return (
                      <AccordionItem
                        key={item.categoryName}
                        value={`item-${index}`}
                        className={index === analysis.analysis.length - 1 ? 'border-b-0' : ''}
                      >
                        <AccordionTrigger className="py-3 text-sm hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Icon className={cn('size-5 shrink-0', status.color)} />
                            <span className="font-semibold">
                              {item.categoryName}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent
                          className={cn('rounded-b-lg p-3 -mx-4 -mb-3', status.bgColor)}
                        >
                          <div className="space-y-2 text-sm">
                            <p>{item.comment}</p>
                            <div className="flex justify-between rounded-md bg-background/50 p-2 text-xs">
                              <span className="text-muted-foreground">Gasto</span>
                              <span className="font-semibold">{formatCurrency(item.spentAmount)}</span>
                            </div>
                            <div className="flex justify-between rounded-md bg-background/50 p-2 text-xs">
                              <span className="text-muted-foreground">Ideal</span>
                              <span className="font-semibold">{formatCurrency(item.idealAmount)}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="font-headline text-xl font-bold">
          Transações de{' '}
          {selectedMonth
            ? format(new Date(selectedMonth + '-02'), 'MMMM', { locale: ptBR })
            : '...'}
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar transações neste mês..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            Nenhuma transação encontrada para este mês.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(groupedTransactions).map(([date, transactions]) => {
              const displayDate = format(new Date(date), "d 'de' MMMM", {
                locale: ptBR,
              });
              return (
                <div key={date} className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {displayDate}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {transactions.map((transaction) => {
                      const Icon =
                        transaction.category &&
                        iconMap[transaction.category.icon];
                      const color = transaction.category?.color || '#888';
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex size-10 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: `${color}20`,
                              }}
                            >
                              {Icon && (
                                <Icon
                                  className="size-5"
                                  style={{ color: color }}
                                />
                              )}
                            </div>
                            <div className='flex flex-col'>
                                <span className="font-medium">
                                {transaction.description}
                                </span>
                                <span className='text-xs text-muted-foreground'>{transaction.category?.name}</span>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'font-bold',
                              transaction.type === 'income'
                                ? 'text-primary'
                                : 'text-destructive'
                            )}
                          >
                            {transaction.type === 'expense' && '- '}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
