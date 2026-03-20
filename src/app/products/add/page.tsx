import { PageHeader } from '@/components/page-header';
import { ProductForm } from '@/components/product-form';

export default function AddProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Adicionar Novo Produto" />
      <ProductForm />
    </div>
  );
}
