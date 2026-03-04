'use client';

import {
  History,
  LayoutDashboard,
  Plus,
  Target,
  Tags,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: History, label: 'Histórico' },
  { href: '/add-transaction', icon: Plus, label: 'Adicionar', isFab: true },
  { href: '/goals', icon: Target, label: 'Metas' },
  { href: '/categories', icon: Tags, label: 'Categorias' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-lg">
        <nav className="relative grid grid-cols-5 items-center">
          {navItems.map((item) => {
            const isActive = item.isFab ? false : pathname === item.href;
            if (item.isFab) {
              return (
                <div key={item.href} className="flex justify-center">
                  <Link
                    href={item.href}
                    className="relative -top-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
                  >
                    <item.icon className="size-8" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary',
                  isActive && 'text-primary'
                )}
              >
                <item.icon className="size-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
