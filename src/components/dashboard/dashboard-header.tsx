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
      <p className="hidden text-sm font-semibold text-primary md:block">
        Página Inicial
      </p>
      <h1 className="font-headline text-2xl font-bold text-foreground md:text-3xl">
        Olá, {greetingName}.
      </h1>
      <p className="hidden capitalize text-muted-foreground md:block">{today}</p>
    </div>
  );
}
