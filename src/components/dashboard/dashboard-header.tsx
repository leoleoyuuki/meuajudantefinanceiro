'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { MessageSquare, User } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export function DashboardHeader() {
  const { user } = useUser();
  const isAnon = user?.isAnonymous;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          {isAnon || !user?.photoURL ? (
            <AvatarFallback className="bg-secondary">
              <User className="size-5 text-muted-foreground" />
            </AvatarFallback>
          ) : (
            <AvatarImage src={user.photoURL} alt="User Avatar" />
          )}
        </Avatar>
        <Button size="sm" className="h-8 rounded-full">
          Upgrade
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="#"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Ganhe R$75
        </Link>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MessageSquare className="size-5" />
          <span className="sr-only">Mensagens</span>
        </Button>
      </div>
    </div>
  );
}
