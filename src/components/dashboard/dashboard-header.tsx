'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DashboardHeader() {
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-foreground">
        Página Inicial
      </h1>
      <p className="text-muted-foreground">{today}</p>
    </div>
  );
}
