import { PageHeader } from '@/components/page-header';
import { TransactionForm } from '@/components/transaction-form';

export default function AddTransactionPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nova Transação" />
      <TransactionForm />
    </div>
  );
}
