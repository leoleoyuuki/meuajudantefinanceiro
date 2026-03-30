'use client';
import { doc, writeBatch, getDoc, increment, Firestore } from 'firebase/firestore';
import type { Transaction, MonthlySummary } from '@/lib/types';
import { format } from 'date-fns';

export async function deleteTransaction(firestore: Firestore, userId: string, transaction: Transaction) {
    const batch = writeBatch(firestore);

    // 1. Delete the transaction document
    const transactionRef = doc(firestore, 'users', userId, 'transactions', transaction.id);
    batch.delete(transactionRef);

    // 2. Update the corresponding monthly summary
    const summaryId = format(new Date(transaction.date), 'yyyy-MM');
    const summaryRef = doc(firestore, 'users', userId, 'monthlySummaries', summaryId);
    
    const summarySnap = await getDoc(summaryRef);
    if (summarySnap.exists()) {
        const incomeDecrement = transaction.type === 'income' ? -transaction.amount : 0;
        const expenseDecrement = transaction.type === 'expense' ? -transaction.amount : 0;
        
        const updateData: { [key: string]: any } = {
            totalIncome: increment(incomeDecrement),
            totalExpense: increment(expenseDecrement),
            netBalance: increment(incomeDecrement - expenseDecrement),
            updatedAt: new Date().toISOString()
        };

        if (transaction.type === 'expense') {
            const summaryData = summarySnap.data() as MonthlySummary;
            const newSpending = summaryData.spendingByCategory?.map(item => {
                if (item.categoryId === transaction.categoryId) {
                    return { ...item, amount: item.amount - transaction.amount };
                }
                return item;
            }).filter(item => item.amount > 0.001); // Use a small epsilon to handle floating point inaccuracies
            updateData.spendingByCategory = newSpending;
        }

        batch.update(summaryRef, updateData);
    }
    
    return batch.commit();
}
