"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { useIdleTimer } from "@/hooks/use-idle-timer";
import { authService, useCurrentUser } from "@/services/auth";
import { useAuth } from "@/contexts/auth-context";
import {
  setLogoutCallback,
  setRefreshTokenGetter,
  setTokenGetter,
  setUpdateTokenCallback,
} from "@/lib/axios";

const AUTH_EVENT_UNAUTHORIZED = "auth:unauthorized" as const;
const AUTH_EVENT_BACKEND_UNAVAILABLE = "auth:backend-unavailable" as const;

const AuthGateScreen = memo(function AuthGateScreen({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="absolute inset-0 bg-linear-to-b from-background via-background to-(--blue-50)/70 dark:to-(--blue-950)/30" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Loader2
          className="h-10 w-10 animate-spin text-primary"
          aria-label="Loading"
        />

        <h1 className="mt-4 text-base font-semibold text-foreground">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}

        <p className="mt-3 text-xs text-muted-foreground">
          Kalau lama, refresh halaman.
        </p>
      </div>
    </div>
  );
});

const AuthProviderComponent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const {
    user,
    token,
    logout,
    getToken,
    getRefreshToken,
    setUser,
    refreshAuth,
    isInitialized,
  } = useAuth();
  const { data: currentUser, isFetching, isError } = useCurrentUser();

  const isLoggedIn = !!token;

  const isLoggingOutRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    setTokenGetter(getToken);
    setRefreshTokenGetter(getRefreshToken);
    setLogoutCallback(logout);
    setUpdateTokenCallback(refreshAuth);
  }, [getToken, getRefreshToken, logout, refreshAuth]);

  const handleShowToast = useCallback((message: string, delayMs: number) => {
    window.setTimeout(() => {
      toast.error(message, { toastId: message });
    }, delayMs);
  }, []);

  const handleLogout = useCallback(
    async (message?: string, delayMs = 0) => {
      if (isLoggingOutRef.current) return;

      isLoggingOutRef.current = true;

      try {
        await authService.logout();
      } catch {
        // ignore network/logout errors, local logout must still happen
      } finally {
        logout();
        isLoggingOutRef.current = false;
      }

      if (!message) return;
      handleShowToast(message, delayMs);
    },
    [handleShowToast, logout]
  );

  useEffect(() => {
    if (!currentUser) return;
    setUser(currentUser);
  }, [currentUser, setUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      void handleLogout(
        "Sesi Anda telah berakhir, silahkan login kembali",
        2000
      );
    };

    const handleBackendUnavailable = () => {
      void handleLogout(
        "Backend tidak tersedia. Silahkan coba lagi nanti.",
        500
      );
    };

    window.addEventListener(AUTH_EVENT_UNAUTHORIZED, handleUnauthorized);
    window.addEventListener(
      AUTH_EVENT_BACKEND_UNAVAILABLE,
      handleBackendUnavailable
    );

    return () => {
      window.removeEventListener(AUTH_EVENT_UNAUTHORIZED, handleUnauthorized);
      window.removeEventListener(
        AUTH_EVENT_BACKEND_UNAVAILABLE,
        handleBackendUnavailable
      );
    };
  }, [handleLogout]);

  const handleIdleLogout = useCallback(() => {
    void handleLogout(
      "Anda telah logout otomatis karena tidak ada aktivitas selama 1 jam",
      500
    );
  }, [handleLogout]);

  const { pause, resume } = useIdleTimer({
    timeout: 60 * 60 * 1000,
    onIdle: handleIdleLogout,
    onActive: () => {
      if (process.env.NODE_ENV !== "development") return;
      console.log("User activity detected, idle timer reset");
    },
  });

  useEffect(() => {
    if (!isLoggedIn) {
      pause();
      return;
    }

    resume();
  }, [isLoggedIn, pause, resume]);

  useEffect(() => {
    if (!token) return;
    if (user) return;
    if (!isError) return;
    if (currentUser) return;

    const timeoutId = window.setTimeout(() => {
      void handleLogout(
        "Tidak dapat terhubung ke server. Silahkan coba lagi nanti.",
        0
      );
    }, 10_000);

    return () => window.clearTimeout(timeoutId);
  }, [currentUser, handleLogout, isError, token, user]);

  useEffect(() => {
    if (!isInitialized) return;
    if (isLoggedIn) return;
    if (hasRedirectedRef.current) return;

    hasRedirectedRef.current = true;
    router.replace("/login");
  }, [isInitialized, isLoggedIn, router]);

  const content = useMemo(() => {
    if (!isInitialized) {
      return (
        <AuthGateScreen
          title="Menyiapkan aplikasi..."
          subtitle="Memuat konfigurasi sesi."
        />
      );
    }

    if (!isLoggedIn) {
      return (
        <AuthGateScreen
          title="Mengalihkan ke halaman login..."
          subtitle="Silakan tunggu sebentar."
        />
      );
    }

    if (token && !user) {
      if (isError) {
        return (
          <AuthGateScreen
            title="Menghubungkan ke server..."
            subtitle="Memverifikasi sesi dan mengambil data akun."
          />
        );
      }

      if (isFetching) {
        return (
          <AuthGateScreen
            title="Memuat data akun..."
            subtitle="Mengambil informasi pengguna."
          />
        );
      }

      return (
        <AuthGateScreen
          title="Memuat data akun..."
          subtitle="Menunggu respons server."
        />
      );
    }

    return <>{children}</>;
  }, [children, isError, isFetching, isInitialized, isLoggedIn, token, user]);

  return <>{content}</>;
};

AuthProviderComponent.displayName = "AuthProvider";

export const AuthProvider = memo(AuthProviderComponent);
