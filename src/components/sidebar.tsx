'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Home,
  History,
  PiggyBank,
  Tags,
  Settings,
  User,
  LogOut,
  MoreHorizontal,
  LifeBuoy,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
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
import { Button } from './ui/button';

const navItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/transactions', icon: History, label: 'Extrato' },
  { href: '/goals', icon: PiggyBank, label: 'Metas' },
  { href: '/categories', icon: Tags, label: 'Categorias' },
];

const ADMIN_EMAIL = 'leo.yuuki@icloud.com';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        window.location.href = '/login';
      });
    }
  };

  const formatDisplayName = (name: string | null | undefined): string => {
    if (!name) return 'Usuário';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1]}`;
    }
    return parts[0] || 'Usuário';
  };
  
  const displayName = formatDisplayName(user?.displayName);

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader className="p-2 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-secondary text-sm font-semibold">
                {user?.displayName
                  ? user.displayName.length > 1
                    ? `${user.displayName
                        .charAt(0)
                        .toUpperCase()}${user.displayName
                        .charAt(1)
                        .toLowerCase()}`
                    : user.displayName.toUpperCase()
                  : <User className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <p className="truncate text-sm font-normal text-foreground">
              {displayName}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuLabel>
                <p className="font-normal">{displayName}</p>
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
        </div>
      </SidebarHeader>

      <SidebarHeader className="hidden p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-sm font-semibold">
                    {user?.displayName
                    ? user.displayName.length > 1
                        ? `${user.displayName.charAt(0).toUpperCase()}${user.displayName.charAt(1).toLowerCase()}`
                        : user.displayName.toUpperCase()
                    : <User className="size-4" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right">
            <DropdownMenuLabel>
              <p className="font-normal">{displayName}</p>
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
      </SidebarHeader>

      <SidebarContent className="p-2 flex-grow">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className="h-9 justify-start gap-2 px-2 group-data-[collapsible=icon]:justify-center"
              >
                <Link href={item.href}>
                  <item.icon className="size-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin'}
                tooltip="Admin"
                className="h-9 justify-start gap-2 px-2 group-data-[collapsible=icon]:justify-center"
              >
                <Link href="/admin">
                  <Shield className="size-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Admin
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/help'}
              tooltip="Ajuda"
              className="h-9 justify-start gap-2 px-2 group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/help">
                <LifeBuoy className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Ajuda
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/settings'}
              tooltip="Configurações"
              className="h-9 justify-start gap-2 px-2 group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/settings">
                <Settings className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Configurações
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
