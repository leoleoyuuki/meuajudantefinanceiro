'use client';

import { PageHeader } from '@/components/page-header';
import { TransactionForm } from '@/components/transaction-form';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Transaction } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type EditTransactionPageProps = {
    params: {
        transactionId: string;
    }
}

export default function EditTransactionPage({ params }: EditTransactionPageProps) {
    const { transactionId } = params;
    const { user } = useUser();
    const firestore = useFirestore();

    const transactionQuery = useMemoFirebase(
        () => (user && transactionId ? doc(firestore, `users/${user.uid}/transactions/${transactionId}`) : null),
        [user, firestore, transactionId]
    );

    const { data: transaction, isLoading } = useDoc<Transaction>(transactionQuery);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Editar Transação" />
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : transaction ? (
                <TransactionForm transactionToEdit={transaction} />
            ) : (
                <p>Transação não encontrada.</p>
            )}
        </div>
    );
}
