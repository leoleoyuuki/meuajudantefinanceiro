import { PageHeader } from '@/components/page-header';
import { GoalForm } from '@/components/goal-form';

export default function AddGoalPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Nova Meta Financeira" />
      <GoalForm />
    </div>
  );
}
