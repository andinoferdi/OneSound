"use client";

import type React from "react";
import { memo, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/auth";
import { type LoginFormData, loginSchema } from "@/types/auth";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import {
  type FieldError,
  type UseFormRegisterReturn,
  useForm,
} from "react-hook-form";

interface LoginPageProps {
  onLogin: () => void;
}

type AuthFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  icon: React.ReactNode;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  rightAdornment?: React.ReactNode;
  autoComplete?: string;
  isDisabled?: boolean;
};

const AuthField = memo((props: AuthFieldProps) => {
  const {
    id,
    label,
    placeholder,
    type,
    icon,
    registration,
    error,
    rightAdornment,
    autoComplete,
    isDisabled,
  } = props;

  const inputBaseClassName =
    "h-12 w-full rounded-2xl border bg-background px-11 text-sm text-foreground shadow-sm outline-none transition " +
    "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

  const inputErrorClassName =
    "border-destructive focus-visible:ring-destructive";
  const inputNormalClassName = "border-border focus-visible:ring-ring";

  const inputClassNameParts = [
    inputBaseClassName,
    error ? inputErrorClassName : inputNormalClassName,
  ];
  const inputClassName = inputClassNameParts.join(" ");

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedByParts = [hintId];
  if (error) describedByParts.push(errorId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <p id={hintId} className="text-xs text-muted-foreground">
          Wajib diisi
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          {icon}
        </div>

        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedByParts.join(" ")}
          disabled={isDisabled}
          className={inputClassName}
          {...registration}
        />

        {rightAdornment ? (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {rightAdornment}
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
});

AuthField.displayName = "AuthField";

const LoginPageComponent = ({ onLogin }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login: loginContext } = useAuth();

  const appName = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_APP_NAME || "Sistem Pelaporan Prestasi Mahasiswa"
    );
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data?.status !== "success") {
        setError("root", {
          type: "manual",
          message: "Login gagal. Silakan coba lagi.",
        });
        return;
      }

      loginContext(data);
      onLogin();
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { data?: { message?: string }; message?: string } };
      };
      const errorMessage =
        axiosError?.response?.data?.data?.message ||
        axiosError?.response?.data?.message ||
        "Login gagal. Silakan coba lagi.";

      setError("root", { type: "manual", message: errorMessage });
    },
  });

  const handleFormSubmit = (formData: LoginFormData) => {
    loginMutation.mutate(formData);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  const isPending = loginMutation.isPending;

  const passwordToggleButtonClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground " +
    "transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-stretch px-4 py-10">
        <div className="hidden w-1/2 flex-col justify-between rounded-3xl border border-border bg-linear-to-br from-primary/10 via-background to-background p-10 shadow-sm lg:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Masuk ke
                </p>
                <h2 className="text-xl font-semibold tracking-tight">
                  {appName}
                </h2>
              </div>
            </div>

            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Tampilan bersih, fokus, dan konsisten dengan tema putih biru. Form
              dibuat rapi, mudah dibaca, dan enak dipakai.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">Akses aman</p>
                  <p className="text-sm text-muted-foreground">
                    Fokus ring jelas, error message jelas, dan flow login tidak
                    membingungkan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">UI elegan</p>
                  <p className="text-sm text-muted-foreground">
                    Card, border, dan shadow halus. Tidak norak dan tidak berat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Gunakan username/email dan password yang valid untuk masuk.
          </p>
        </div>

        <div className="flex w-full items-center justify-center lg:w-1/2 lg:pl-10">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-8 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Selamat datang
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
              <p className="text-sm text-muted-foreground">
                Silakan isi kredensial Anda untuk melanjutkan.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
              noValidate
            >
              {errors.root ? (
                <div
                  className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {errors.root.message}
                </div>
              ) : null}

              <AuthField
                id="username"
                label="Username atau Email"
                placeholder="contoh: andino@email.com"
                type="text"
                icon={<User className="h-5 w-5" aria-hidden="true" />}
                registration={register("username")}
                error={errors.username}
                autoComplete="username"
                isDisabled={isPending}
              />

              <AuthField
                id="password"
                label="Password"
                placeholder="Masukkan password"
                type={showPassword ? "text" : "password"}
                icon={<Lock className="h-5 w-5" aria-hidden="true" />}
                registration={register("password")}
                error={errors.password}
                autoComplete="current-password"
                isDisabled={isPending}
                rightAdornment={
                  <button
                    type="button"
                    onClick={handleTogglePasswordVisibility}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    aria-pressed={showPassword}
                    disabled={isPending}
                    className={passwordToggleButtonClassName}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-2xl text-base font-semibold shadow-sm disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Pastikan data login benar. Jika gagal, cek kembali
                username/email dan password Anda.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

LoginPageComponent.displayName = "LoginPage";

export default memo(LoginPageComponent);
