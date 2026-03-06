'use client';

import { PageHeader } from '@/components/page-header';
import { iconMap } from '@/lib/icons';
import type {
  Transaction,
  Category,
  MonthlySummary,
  QueryDocumentSnapshot,
} from '@/lib/types';
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
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  limit,
  startAfter,
} from 'firebase/firestore';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

// Based on common financial advice (50/30/20 rule adjusted)
const idealPercentages: { [key: string]: number } = {
  Moradia: 30,
  Transporte: 15,
  Alimentação: 15,
  Saúde: 10,
  Lazer: 10,
  Educação: 5,
  Investimentos: 20,
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

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const TRANSACTION_LIMIT = 15;

  const categoriesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'categories') : null,
    [firestore, user]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesQuery);

  useEffect(() => {
    if (!user || !selectedMonth || !firestore) {
      setTransactions([]);
      setTransactionsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      setTransactions([]);
      setLastDoc(null);
      setHasMore(true);

      const [year, month] = selectedMonth.split('-').map(Number);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;

      const q = query(
        collection(firestore, 'users', user.uid, 'transactions'),
        where('date', '>=', selectedMonth),
        where('date', '<', endDate),
        orderBy('date', 'desc'),
        limit(TRANSACTION_LIMIT)
      );

      try {
        const documentSnapshots = await getDocs(q);
        const newTransactions = documentSnapshots.docs.map((doc) => ({
          ...(doc.data() as object),
          id: doc.id,
        })) as Transaction[];
        setTransactions(newTransactions);
        const lastVisible =
          documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastDoc(lastVisible);
        setHasMore(documentSnapshots.docs.length === TRANSACTION_LIMIT);
      } catch (error) {
        console.error('Error fetching transactions: ', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [user, selectedMonth, firestore]);

  const handleLoadMore = async () => {
    if (!user || !selectedMonth || !firestore || !lastDoc || !hasMore) return;

    setLoadingMore(true);

    const [year, month] = selectedMonth.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;

    const q = query(
      collection(firestore, 'users', user.uid, 'transactions'),
      where('date', '>=', selectedMonth),
      where('date', '<', endDate),
      orderBy('date', 'desc'),
      startAfter(lastDoc),
      limit(TRANSACTION_LIMIT)
    );

    try {
      const documentSnapshots = await getDocs(q);
      const newTransactions = documentSnapshots.docs.map((doc) => ({
        ...(doc.data() as object),
        id: doc.id,
      })) as Transaction[];
      setTransactions((prev) => [...prev, ...newTransactions]);
      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(documentSnapshots.docs.length === TRANSACTION_LIMIT);
    } catch (error) {
      console.error('Error fetching more transactions: ', error);
    } finally {
      setLoadingMore(false);
    }
  };

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

  const analysis = useMemo(() => {
    if (!selectedSummary) return null;

    if (selectedSummary.totalIncome === 0) {
      return {
        analysis: categorySpendingData.map((item) => ({
          categoryName: item.category,
          spentAmount: item.amount,
          idealAmount: 0,
          comment: `Gasto de ${formatCurrency(
            item.amount
          )}. Análise indisponível sem registro de renda.`,
          status: 'good' as const,
        })),
        summary:
          'Não há renda registrada para este mês, então não é possível fazer uma análise. Adicione suas receitas para começar!',
      };
    }

    const analysisItems = categorySpendingData.map((item) => {
      const idealPercentage = idealPercentages[item.category] || 5;
      const idealAmount =
        selectedSummary.totalIncome * (idealPercentage / 100);
      const spentAmount = item.amount;
      const ratio =
        idealAmount > 0
          ? spentAmount / idealAmount
          : spentAmount > 0
          ? Infinity
          : 0;

      let status: 'good' | 'warning' | 'over';
      let comment: string;

      if (ratio <= 1.05) {
        status = 'good';
        comment = `Ótimo! Seus gastos com ${item.category} estão dentro do esperado.`;
      } else if (ratio <= 1.2) {
        status = 'warning';
        comment = `Atenção: seus gastos com ${item.category} estão um pouco acima do ideal.`;
      } else {
        status = 'over';
        comment = `Cuidado! Seus gastos com ${item.category} estão bem acima do ideal.`;
      }

      if (idealAmount === 0 && spentAmount > 0) {
        comment = `Esta categoria não tem um gasto ideal definido, mas você gastou ${formatCurrency(
          spentAmount
        )}.`;
      }

      return {
        categoryName: item.category,
        spentAmount,
        idealAmount,
        comment,
        status,
      };
    });

    const overspentCategories = analysisItems.filter(
      (i) => i.status === 'over'
    );
    const overspentNames = overspentCategories.map((c) => c.categoryName);
    let summary: string;

    if (overspentNames.length > 1) {
      const last = overspentNames.pop();
      summary = `Você está gastando muito em ${overspentNames.join(
        ', '
      )} e ${last}. É um bom ponto de partida para economizar!`;
    } else if (overspentNames.length === 1) {
      summary = `Você está gastando muito em ${overspentNames[0]}. É um bom ponto de partida para economizar!`;
    } else if (analysisItems.some((i) => i.status === 'warning')) {
      summary =
        'Você está quase lá! Alguns gastos estão um pouco acima do ideal, mas com pequenos ajustes você equilibra as contas.';
    } else if (analysisItems.length > 0) {
      summary =
        'Parabéns! Seus gastos estão bem distribuídos e dentro do planejado. Continue assim!';
    } else {
      summary = 'Nenhuma despesa registrada para análise neste mês.';
    }

    return {
      analysis: analysisItems,
      summary,
    };
  }, [selectedSummary, categorySpendingData]);

  const enrichedTransactions = useMemo(() => {
    if (!transactions || !categories) return [];
    return transactions.map((t) => ({
      ...t,
      category: categories.find((c) => c.id === t.categoryId),
    }));
  }, [transactions, categories]);

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
  const isLoading = summariesLoading || categoriesLoading;

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
                Compare seus gastos com as{' '}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help font-semibold text-primary underline decoration-dotted underline-offset-2">
                      porcentagens ideais
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2 p-1">
                      <h4 className="font-semibold">
                        Regra 50-30-20: Orçamento Ideal
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Baseado na sua renda, seus gastos são comparados com
                        estas sugestões.
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {Object.entries(idealPercentages).map(
                          ([category, percentage]) => (
                            <li
                              key={category}
                              className="flex justify-between gap-4"
                            >
                              <span className="font-medium text-muted-foreground">
                                {category}
                              </span>
                              <span className="font-bold">{percentage}%</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
                .
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
                  <h3 className="font-semibold">Análise de Gastos</h3>
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
                  className="w-full rounded-lg border"
                >
                  {analysis.analysis.map((item, index) => {
                    const status = statusConfig[item.status];
                    const Icon = status.icon;
                    return (
                      <AccordionItem
                        key={item.categoryName}
                        value={`item-${index}`}
                        className={cn(
                          index === analysis.analysis.length - 1
                            ? 'border-b-0'
                            : 'border-b'
                        )}
                      >
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Icon
                              className={cn('size-5 shrink-0', status.color)}
                            />
                            <span className="font-semibold">
                              {item.categoryName}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent
                          className={cn('px-4 pb-4 pt-0', status.bgColor)}
                        >
                          <div className="space-y-2 text-sm">
                            <p>{item.comment}</p>
                            <div className="flex justify-between rounded-md bg-background/50 p-2 text-xs">
                              <span className="text-muted-foreground">
                                Gasto
                              </span>
                              <span className="font-semibold">
                                {formatCurrency(item.spentAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between rounded-md bg-background/50 p-2 text-xs">
                              <span className="text-muted-foreground">
                                Ideal
                              </span>
                              <span className="font-semibold">
                                {formatCurrency(item.idealAmount)}
                              </span>
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

        {transactionsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
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
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {transaction.description}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {transaction.category?.name}
                              </span>
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

        {!transactionsLoading && hasMore && (
          <div className="mt-6 flex justify-center">
            <Button onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Ver mais
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
