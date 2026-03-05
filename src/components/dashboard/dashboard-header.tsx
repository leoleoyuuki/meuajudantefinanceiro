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
    <div>
      <p className="text-sm font-semibold text-primary">
        Página Inicial
      </p>
      <h1 className="font-headline text-2xl font-bold text-foreground md:text-3xl">
        Olá, {greetingName}.
      </h1>
      <p className="capitalize text-muted-foreground">{today}</p>
    </div>
  );
}
