'use client';

import { useUser } from '@/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DashboardHeader() {
  const { user } = useUser();

  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Usuário';
    return name.split(' ')[0] || 'Usuário';
  };
  
  const greetingName = getFirstName(user?.displayName);

  const today = format(new Date(), "EEEE, d 'de' MMMM", {
    locale: ptBR,
  });

  return (
    <div className="hidden md:block">
      <p className="text-sm text-primary font-semibold">Página Inicial</p>
      <h1 className="font-headline text-3xl font-bold text-foreground">
        Olá, {greetingName}.
      </h1>
      <p className="text-muted-foreground capitalize">{today}</p>
    </div>
  );
}
