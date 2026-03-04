'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import {
  User,
  LogOut,
  Crown,
  Gift,
  Copy,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export function DashboardHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-9 cursor-pointer">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt="User Avatar" />
              ) : (
                <AvatarFallback className="bg-secondary">
                  <User className="size-5 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>
              <p className="font-semibold">
                {user?.displayName || 'Usuário'}
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                {user?.email || 'Login com Google'}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="h-8 rounded-full">
              <Crown className="mr-2 size-4" />
              Premium
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="text-sm">
              Você tem <strong>30 dias</strong> restantes em seu teste.
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" className="px-1 text-primary">
              <Gift className="mr-2 size-4" />
              Indique e Ganhe
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Indique um amigo</h4>
                <p className="text-sm text-muted-foreground">
                  Seu amigo economiza{' '}
                  <span className="font-bold text-primary">
                    {formatCurrency(discount)} (15% OFF)
                  </span>{' '}
                  na anuidade.
                </p>
              </div>
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
            </div>
          </PopoverContent>
        </Popover>

        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="#">
            <LifeBuoy className="size-5" />
            <span className="sr-only">Ajuda</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

    