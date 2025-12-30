'use client';

import type React from 'react';

import { AppSidebar } from '@/components/layouts/dashboard-sidebar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { DashboardHeader } from '@/components/layouts/dashboard-header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex-1 bg-muted' suppressHydrationWarning>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className='grid h-screen grid-rows-[64px_calc(100vh-64px)]'>
            <DashboardHeader />
            <ScrollArea className='flex flex-1 flex-col gap-4 overflow-x-auto'>
              <div className='w-full max-w-screen p-2 pt-0 md:max-w-[calc(100vw-16rem)] lg:p-6'>{children}</div>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
