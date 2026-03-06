'use client';

import { History, Home, Plus, PiggyBank, Tags } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Items for the tab bar, excluding the central action button.
const navItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/transactions', icon: History, label: 'Extrato' },
  { href: '/goals', icon: PiggyBank, label: 'Metas' },
  { href: '/categories', icon: Tags, label: 'Categorias' },
];

export function BottomNav() {
  const pathname = usePathname();

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
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <Link
            href="/add-transaction"
            className={cn(
              'relative flex size-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105',
              'overflow-hidden'
            )}
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 24px, currentColor 24px, currentColor 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, currentColor 24px, currentColor 25px)',
              }}
            />
            <Plus className="relative h-7 w-7" />
            <span className="sr-only">Adicionar</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}