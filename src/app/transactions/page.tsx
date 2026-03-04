'use client';

import { PageHeader } from '@/components/page-header';
import { iconMap } from '@/lib/icons';
import type { Transaction, Category } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  limit,
  onSnapshot,
  getDocs,
  startAfter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';

function groupTransactionsByDay(transactions: Transaction[]) {
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

const TRANSACTIONS_PER_PAGE = 20;

export default function TransactionsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesQuery);

  useEffect(() => {
    if (!user || !firestore) return;

    setInitialLoading(true);
    const transactionsRef = collection(
      firestore,
      'users',
      user.uid,
      'transactions'
    );
    const q = query(
      transactionsRef,
      orderBy('date', 'desc'),
      limit(TRANSACTIONS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTransactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        newTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setAllTransactions(newTransactions);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === TRANSACTIONS_PER_PAGE);
      setInitialLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const handleLoadMore = async () => {
    if (!user || !firestore || !lastDoc || moreLoading) return;

    setMoreLoading(true);
    const transactionsRef = collection(
      firestore,
      'users',
      user.uid,
      'transactions'
    );
    const q = query(
      transactionsRef,
      orderBy('date', 'desc'),
      startAfter(lastDoc),
      limit(TRANSACTIONS_PER_PAGE)
    );

    const documentSnapshots = await getDocs(q);
    const newTransactions: Transaction[] = [];
    documentSnapshots.forEach((doc) => {
      newTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });

    setAllTransactions((prev) => [...prev, ...newTransactions]);
    setLastDoc(
      documentSnapshots.docs[documentSnapshots.docs.length - 1] || null
    );
    setHasMore(documentSnapshots.docs.length === TRANSACTIONS_PER_PAGE);
    setMoreLoading(false);
  };

  const enrichedTransactions = useMemo(() => {
    if (!allTransactions || !categories) return [];
    return allTransactions.map((t) => ({
      ...t,
      category: categories.find((c) => c.id === t.categoryId),
    }));
  }, [allTransactions, categories]);

  const groupedTransactions = groupTransactionsByDay(enrichedTransactions);

  const isLoading = initialLoading || categoriesLoading;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Histórico" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Pesquisar transações..." className="pl-10" />
      </div>
      {isLoading ? (
        <div className="flex justify-center pt-10">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedTransactions).map(([date, transactions]) => {
            const displayDate = format(new Date(date), "d 'de' MMMM", {
              locale: ptBR,
            });
            return (
              <div key={date} className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {displayDate}
                </h2>
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
                          <span className="font-medium">
                            {transaction.description}
                          </span>
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
          {hasMore && (
            <Button onClick={handleLoadMore} disabled={moreLoading}>
              {moreLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Carregar Mais
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
