'use client';

import { usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  LogOut,
  User,
  Settings,
  Crown,
  Gift,
  LifeBuoy,
} from 'lucide-react';
import Link from 'next/link';

export function MobileHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  const getPageTitle = () => {
    if (pathname === '/') return 'Início';
    if (pathname.startsWith('/transactions')) return 'Extrato';
    if (pathname.startsWith('/add-transaction')) return 'Nova Transação';
    if (pathname.startsWith('/goals/add')) return 'Nova Meta';
    if (pathname.startsWith('/goals')) return 'Metas';
    if (pathname.startsWith('/categories')) return 'Categorias';
    return 'Meu Ajudante';
  };

  const displayName = user?.displayName || 'Usuário';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
      <h1 className="font-headline text-xl font-bold">{getPageTitle()}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary text-sm font-semibold">
                {user?.displayName ? (
                  user.displayName.length > 1 ? (
                    `${user.displayName
                      .charAt(0)
                      .toUpperCase()}${user.displayName
                      .charAt(1)
                      .toLowerCase()}`
                  ) : (
                    user.displayName.toUpperCase()
                  )
                ) : (
                  <User className="size-4" />
                )}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10}>
          <DropdownMenuLabel>
            <p className="font-normal">{displayName}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {user?.email || 'Login com Google'}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="#">
              <Crown className="mr-2 h-4 w-4" />
              <span>Premium</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="#">
              <Gift className="mr-2 h-4 w-4" />
              <span>Indique e Ganhe</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="#">
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Ajuda</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="#">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
