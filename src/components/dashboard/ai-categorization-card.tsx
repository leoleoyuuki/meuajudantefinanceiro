import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import Link from 'next/link';

export function AICategorizationCard() {
  return (
    <Card className="relative overflow-hidden bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 to-transparent" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          <span>Categorização com IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="mb-4 text-sm text-muted-foreground">
          Economize tempo! Nossa IA sugere categorias automaticamente para suas
          novas despesas.
        </p>
        <Button asChild variant="outline">
          <Link href="/add-transaction">Adicionar Despesa</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
