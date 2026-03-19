import { PageHeader } from '@/components/page-header';
import { ClipboardList } from 'lucide-react';

export default function AccountsReceivablePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Contas a Receber" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center min-h-[60vh] md:min-h-0">
        <div className="md:hidden -mt-16">
          <h1 className="font-headline text-xl font-bold">Contas a Receber</h1>
        </div>
        <ClipboardList className="size-12 text-muted-foreground" />
        <h2 className="font-headline text-xl font-semibold">Em Construção</h2>
        <p className="text-muted-foreground">
          A página de contas a receber estará disponível em breve para usuários do plano Empreendedor.
        </p>
      </div>
    </div>
  );
}
