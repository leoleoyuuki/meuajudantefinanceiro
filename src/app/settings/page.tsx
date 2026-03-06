
import { PageHeader } from '@/components/page-header';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center min-h-[60vh] md:min-h-0">
        <div className="md:hidden -mt-16">
          <h1 className="font-headline text-xl font-bold">Configurações</h1>
        </div>
        <Settings className="size-12 text-muted-foreground" />
        <h2 className="font-headline text-xl font-semibold">Em Construção</h2>
        <p className="text-muted-foreground">
          A página de configurações estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
