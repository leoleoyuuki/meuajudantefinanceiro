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
  Copy,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Button } from './ui/button';

export function MobileHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  const getPageTitle = () => {
    if (pathname === '/') return '';
    if (pathname.startsWith('/transactions')) return 'Extrato';
    if (pathname.startsWith('/add-transaction')) return 'Nova Transação';
    if (pathname.startsWith('/goals/add')) return 'Nova Meta';
    if (pathname.startsWith('/goals')) return 'Metas';
    if (pathname.startsWith('/categories')) return 'Categorias';
    return 'Meu Ajudante';
  };

  const handleCopyCoupon = () => {
    const coupon = 'FINPRO15';
    navigator.clipboard.writeText(coupon);
    toast({
      title: 'Cupom copiado!',
      description: 'Compartilhe com seus amigos.',
    });
  };

  const annualPrice = 299.9;
  const discount = annualPrice * 0.15;
  const displayName = user?.displayName || 'Usuário';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-background/95 px-4 backdrop-blur-sm">
      <h1 className="font-headline text-xl font-bold">{getPageTitle()}</h1>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Gift className="size-5 text-primary" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Indique um amigo</DialogTitle>
              <DialogDescription>
                Seu amigo economiza{' '}
                <span className="font-bold text-primary">
                  {formatCurrency(discount)} (15% OFF)
                </span>{' '}
                na anuidade.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="flex-1 rounded-md border border-dashed border-primary bg-primary/10 px-3 py-2 text-center font-mono text-sm font-semibold text-primary">
                FINPRO15
              </div>
              <Button
                onClick={handleCopyCoupon}
                size="icon"
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Premium</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown /> Premium
                  </DialogTitle>
                </DialogHeader>
                <div className="text-sm">
                  Você tem <strong>30 dias</strong> restantes em seu teste.
                </div>
              </DialogContent>
            </Dialog>

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
      </div>
    </header>
  );
}
