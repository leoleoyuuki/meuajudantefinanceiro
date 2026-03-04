'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  History,
  PiggyBank,
  Tags,
  Plus,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

const navItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/transactions', icon: History, label: 'Extrato' },
  { href: '/goals', icon: PiggyBank, label: 'Metas' },
  { href: '/categories', icon: Tags, label: 'Categorias' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <PiggyBank className="size-6 text-primary" />
          <h1 className="font-headline text-lg font-semibold">MeuAjudante</h1>
        </div>
        <PiggyBank className="hidden size-6 text-primary group-data-[collapsible=icon]:block" />
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <Button
            asChild
            className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
          >
            <Link href="/add-transaction">
              <Plus />
              <span className="group-data-[collapsible=icon]:hidden">
                Nova Transação
              </span>
            </Link>
          </Button>
        </div>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className="justify-start group-data-[collapsible=icon]:justify-center"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configurações" className="justify-start group-data-[collapsible=icon]:justify-center">
              <Settings />
              <span className="group-data-[collapsible=icon]:hidden">
                Configurações
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
