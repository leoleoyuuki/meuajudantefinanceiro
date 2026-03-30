'use client';

import { PageHeader } from '@/components/page-header';
import { GoalForm } from '@/components/goal-form';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { FinancialGoal } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type EditGoalPageProps = {
    params: {
        goalId: string;
    }
}

export default function EditGoalPage({ params }: EditGoalPageProps) {
    const { goalId } = params;
    const { user } = useUser();
    const firestore = useFirestore();

    const goalQuery = useMemoFirebase(
        () => (user && goalId ? doc(firestore, `users/${user.uid}/financialGoals/${goalId}`) : null),
        [user, firestore, goalId]
    );

    const { data: goal, isLoading } = useDoc<FinancialGoal>(goalQuery);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Editar Meta Financeira" />
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : goal ? (
                <GoalForm goalToEdit={goal} />
            ) : (
                <p>Meta não encontrada.</p>
            )}
        </div>
    );
}
