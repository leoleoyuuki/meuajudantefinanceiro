'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';

export function DashboardHeader() {
  const userImage = placeholderImages.find((p) => p.id === 'user-avatar');
  const { user } = useUser();

  const displayName = user?.isAnonymous
    ? 'Usuário Anônimo'
    : user?.displayName || 'Usuário';

  const photoURL = user && !user.isAnonymous ? user.photoURL : userImage?.src;

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-base text-muted-foreground">Bem-vindo(a) de volta,</p>
        <h1 className="font-headline text-2xl font-bold text-foreground">
          {displayName}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="size-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        <Avatar className="size-12 border-2 border-primary/20">
          <AvatarImage
            src={photoURL || ''}
            alt="User Avatar"
            data-ai-hint={userImage?.hint}
          />
          <AvatarFallback>{displayName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
