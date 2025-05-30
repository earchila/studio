
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/Header';
import { AppLogo } from '@/components/layout/AppLogo';
import { SidebarNav, type NavItem } from '@/components/layout/SidebarNav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, FileText, AlertTriangle, Settings, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contracts', label: 'Contracts', icon: FileText },
  { href: '/contracts/add', label: 'Add Contract', icon: UploadCloud },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/settings', label: 'Settings', icon: Settings, disabled: true }, // Example of a disabled item
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="block group-data-[collapsible=icon]:hidden">
            <AppLogo />
          </Link>
           <Link href="/dashboard" className="hidden group-data-[collapsible=icon]:block">
            <AppLogo className="w-8 h-8" /> {/* Smaller logo for collapsed state */}
          </Link>
        </SidebarHeader>
        <SidebarContent asChild>
          <ScrollArea className="flex-1">
            <SidebarNav navItems={navItems} />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-sidebar-foreground/70">
            &copy; {new Date().getFullYear()} Cymbal Retail / Confidential
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

