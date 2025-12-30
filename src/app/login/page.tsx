"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import LoginPage from "@/blocks/login";
import QueryProvider from "@/components/providers/query-provider";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

const LoginPageContent = () => {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  const handleLoginSuccess = () => {
    router.replace("/dashboard");
  };

  if (token) {
    return null;
  }

  return <LoginPage onLogin={handleLoginSuccess} />;
};

const LoginPageWrapper = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <LoginPageContent />
      </AuthProvider>
    </QueryProvider>
  );
};

export default LoginPageWrapper;
