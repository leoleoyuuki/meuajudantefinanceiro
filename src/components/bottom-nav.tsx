'use client';

import {
  History,
  Home,
  Plus,
  PiggyBank,
  Tags,
  TrendingUp,
  Package,
  ShoppingCart,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useState } from 'react';

const personalNavItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/transactions', icon: History, label: 'Extrato' },
  { href: '/goals', icon: PiggyBank, label: 'Metas' },
  { href: '/categories', icon: Tags, label: 'Categorias' },
];

const entrepreneurNavItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/cash-flow', icon: TrendingUp, label: 'Fluxo de Caixa' },
  { href: '/goals', icon: PiggyBank, label: 'Metas' },
  { href: '/products', icon: Package, label: 'Produtos' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const [sheetOpen, setSheetOpen] = useState(false);

  const userProfileQuery = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileQuery);
  const isEntrepreneur = userProfile?.planType === 'entrepreneur';

  const navItems = isEntrepreneur ? entrepreneurNavItems : personalNavItems;

  const FabButton = ({ isEntrepreneur }: { isEntrepreneur?: boolean }) => (
    <div
      className={cn(
        'pointer-events-auto relative flex size-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105',
        'overflow-hidden'
      )}
      style={{
        background:
          'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)',
      }}
    >
      <Plus className="relative h-7 w-7" />
      <span className="sr-only">
        {isEntrepreneur ? 'Nova Ação' : 'Adicionar'}
      </span>
    </div>
  );

  return (
    <footer className="fixed bottom-4 inset-x-4 z-50 h-20">
      <div className="relative mx-auto h-full w-full max-w-md">
        {/* Background nav bar */}
        <div className="absolute bottom-0 flex h-16 w-full items-center justify-around rounded-full bg-card p-1.5 shadow-lg ring-1 ring-border">
          {/* Left items */}
          <div className="flex w-2/5 justify-around">
            {navItems.slice(0, 2).map((item) => {
              const isActive = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 transition-all duration-300',
                    isActive
                      ? 'font-semibold text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className="text-[10px] font-medium tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right items */}
          <div className="flex w-2/5 justify-around">
            {navItems.slice(2, 4).map((item) => {
              const isActive = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 transition-all duration-300',
                    isActive
                      ? 'font-semibold text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className="text-[10px] font-medium tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Centered "Add" button */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          {isEntrepreneur ? (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="p-0 border-none bg-transparent h-auto w-auto">
                  <FabButton isEntrepreneur />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>O que você deseja fazer?</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-6">
                  <Button
                    asChild
                    size="lg"
                    onClick={() => setSheetOpen(false)}
                  >
                    <Link href="/sales/new">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Registrar Venda
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    onClick={() => setSheetOpen(false)}
                  >
                    <Link href="/add-transaction">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Lançamento Manual
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Link href="/add-transaction">
              <FabButton />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
