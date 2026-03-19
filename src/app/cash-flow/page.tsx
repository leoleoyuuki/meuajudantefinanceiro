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
  ArrowDown,
  ArrowUp,
  Scale,
  PlusCircle,
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePrivacy } from '@/context/privacy-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

interface TransactionsCacheEntry {
  transactions: Transaction[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export default function CashFlowPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { isBalanceVisible } = usePrivacy();
  const censoredPlaceholder = 'R$ ●●●●●';
  const [searchTerm, setSearchTerm] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);

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

  // Transaction fetching logic
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const TRANSACTION_LIMIT = 15;
  const [transactionsCache, setTransactionsCache] = useState<
    Record<string, TransactionsCacheEntry>
  >({});

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

      if (transactionsCache[selectedMonth]) {
        const cachedData = transactionsCache[selectedMonth];
        setTransactions(cachedData.transactions);
        setLastDoc(cachedData.lastDoc);
        setHasMore(cachedData.hasMore);
        setTransactionsLoading(false);
        return;
      }

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
        const lastVisible =
          documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;
        const newHasMore = documentSnapshots.docs.length === TRANSACTION_LIMIT;

        setTransactions(newTransactions);
        setLastDoc(lastVisible);
        setHasMore(newHasMore);

        setTransactionsCache((prevCache) => ({
          ...prevCache,
          [selectedMonth]: {
            transactions: newTransactions,
            lastDoc: lastVisible,
            hasMore: newHasMore,
          },
        }));
      } catch (error) {
        console.error('Error fetching transactions: ', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [user, selectedMonth, firestore, transactionsCache]);

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
      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;
      const newHasMore = documentSnapshots.docs.length === TRANSACTION_LIMIT;

      setTransactions((prev) => {
        const updatedTransactions = [...prev, ...newTransactions];
        setTransactionsCache((prevCache) => ({
          ...prevCache,
          [selectedMonth]: {
            transactions: updatedTransactions,
            lastDoc: lastVisible,
            hasMore: newHasMore,
          },
        }));
        return updatedTransactions;
      });
      setLastDoc(lastVisible);
      setHasMore(newHasMore);
    } catch (error) {
      console.error('Error fetching more transactions: ', error);
    } finally {
      setLoadingMore(false);
    }
  };
  // End of transaction fetching logic

  const selectedSummary = useMemo(() => {
    return summaries?.find((s) => s.id === selectedMonth);
  }, [selectedMonth, summaries]);

  const cashFlowData = useMemo(() => {
    if (!selectedSummary) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        finalBalance: initialBalance,
      };
    }
    return {
      totalIncome: selectedSummary.totalIncome,
      totalExpense: selectedSummary.totalExpense,
      finalBalance:
        initialBalance +
        selectedSummary.totalIncome -
        selectedSummary.totalExpense,
    };
  }, [selectedSummary, initialBalance]);

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
      <PageHeader title="Fluxo de Caixa" />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/add-transaction?type=income">
            <PlusCircle className="mr-2" />
            Nova Receita
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/add-transaction?type=expense">
            <PlusCircle className="mr-2" />
            Nova Despesa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <CardTitle>Resumo do Mês</CardTitle>
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
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Configuração</h3>
            <div className="space-y-2">
              <label
                htmlFor="initial-balance"
                className="text-sm font-medium text-muted-foreground"
              >
                Saldo Inicial do Mês
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  R$
                </span>
                <Input
                  id="initial-balance"
                  type="number"
                  placeholder="0,00"
                  value={initialBalance === 0 ? '' : initialBalance}
                  onChange={(e) =>
                    setInitialBalance(Number(e.target.value))
                  }
                  className="pl-10 text-lg"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold text-foreground">
              Balanço do Período
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Saldo Inicial</span>
                <span>
                  {isBalanceVisible
                    ? formatCurrency(initialBalance)
                    : censoredPlaceholder}
                </span>
              </div>
              <div className="flex items-center justify-between text-primary">
                <span className="flex items-center gap-2">
                  <ArrowUp className="size-4" /> Entradas
                </span>
                <span>
                  +{' '}
                  {isBalanceVisible
                    ? formatCurrency(cashFlowData.totalIncome)
                    : censoredPlaceholder}
                </span>
              </div>
              <div className="flex items-center justify-between text-destructive">
                <span className="flex items-center gap-2">
                  <ArrowDown className="size-4" /> Saídas
                </span>
                <span>
                  -{' '}
                  {isBalanceVisible
                    ? formatCurrency(cashFlowData.totalExpense)
                    : censoredPlaceholder}
                </span>
              </div>
              <div className="!mt-4 flex items-center justify-between border-t border-dashed pt-3 text-lg font-bold">
                <span className="flex items-center gap-2">
                  <Scale className="size-4" /> Saldo Final
                </span>
                <span>
                  {isBalanceVisible
                    ? formatCurrency(cashFlowData.finalBalance)
                    : censoredPlaceholder}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="font-headline text-xl font-bold">
          Movimentações de{' '}
          {selectedMonth
            ? format(new Date(selectedMonth + '-02'), 'MMMM', { locale: ptBR })
            : '...'}
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar movimentações..."
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
            Nenhuma movimentação encontrada para este mês.
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
                            {isBalanceVisible ? (
                              <>
                                {transaction.type === 'expense' && '- '}
                                {formatCurrency(transaction.amount)}
                              </>
                            ) : (
                              censoredPlaceholder
                            )}
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
