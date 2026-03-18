import { PageHeader } from '@/components/page-header';
import { TransactionForm } from '@/components/transaction-form';

type AddTransactionPageProps = {
  searchParams: {
    categoryId?: string;
    type?: 'income' | 'expense';
  };
};

export default function AddTransactionPage({
  searchParams,
}: AddTransactionPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nova Transação" />
      <TransactionForm
        initialCategoryId={searchParams.categoryId}
        initialType={searchParams.type}
      />
    </div>
  );
}
