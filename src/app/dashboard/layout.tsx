"use client";

import { type ReactNode } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthProvider as AppAuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AuthProvider } from "@/contexts/auth-context";
import QueryProvider from "@/components/providers/query-provider";
import { TitleProvider } from "@/components/providers/title-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const DashboardLayoutWrapper = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      enableColorScheme={false}
    >
      <QueryProvider>
        <ToastProvider />
        <TitleProvider>
          <AuthProvider>
            <AppAuthProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </AppAuthProvider>
          </AuthProvider>
        </TitleProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

export default DashboardLayoutWrapper;
