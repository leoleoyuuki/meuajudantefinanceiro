'use client';

import {
  Crown,
  Gift,
  Copy,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();

  const handleCopyCoupon = () => {
    const coupon = 'FINPRO15';
    navigator.clipboard.writeText(coupon);
    toast({
      title: 'Cupom copiado!',
      description: 'Compartilhe com seus amigos.',
    });
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  const annualPrice = 299.9;
  const discount = annualPrice * 0.15;
  const displayName = user?.displayName || 'Usuário';

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="ml-auto flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="h-9 rounded-full">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              className="px-1 font-semibold text-foreground hover:text-primary hover:no-underline"
            >
              <Gift className="mr-2 size-4 text-primary" />
              Indique Amigos
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserIcon className="size-5" />
              <span className="sr-only">Menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-normal">{displayName}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {user?.email || 'Login com Google'}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
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
