'use client';

import {
  History,
  Home,
  Plus,
  PiggyBank,
  Tags,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/transactions', icon: History, label: 'Extrato' },
  { href: '/add-transaction', icon: Plus, label: 'Adicionar' },
  { href: '/goals', icon: PiggyBank, label: 'Metas' },
  { href: '/categories', icon: Tags, label: 'Categorias' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-4 inset-x-4 z-50">
      <div className="mx-auto w-full max-w-md">
        <nav className="flex items-center justify-around rounded-full bg-card p-1.5 shadow-lg ring-1 ring-border">
          {navItems.map((item) => {
            const isActive = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 transition-all duration-300',
                  isActive
                    ? 'bg-muted font-semibold text-primary'
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
        </nav>
      </div>
    </footer>
  );
}