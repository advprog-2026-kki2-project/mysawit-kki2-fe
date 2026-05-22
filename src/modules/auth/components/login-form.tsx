"use client";

import Link from "next/link";
import { startTransition, useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, login, logout } from "@/modules/auth/data/auth-api";
import { roleLabels } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [safeNextPath, setSafeNextPath] = useState("/dashboard");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {
    session,
    isLoading,
    error: sessionError,
    refreshSession,
  } = useAuthSession();

  useEffect(() => {
    const nextPath = new URLSearchParams(window.location.search).get("next");

    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      setSafeNextPath(nextPath);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      setFeedback(result.message);
      await refreshSession();
      startTransition(() => {
        router.push(safeNextPath);
        router.refresh();
      });
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Login gagal. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setError(null);
    setFeedback(null);

    try {
      await logout();
      await refreshSession();
      setFeedback("Sesi berhasil diakhiri.");
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Logout gagal. Coba lagi.");
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded-full bg-[#e3e3dc]" />
        <div className="h-12 animate-pulse rounded-full bg-[#e3e3dc]" />
        <div className="h-12 animate-pulse rounded-full bg-[#e3e3dc]" />
        <div className="h-12 animate-pulse rounded-full bg-[#e3e3dc]" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="space-y-6">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#cdedae] text-[#3f6901]">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="mono-label text-[#74796d]">Sesi Aktif</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
            Anda sudah masuk.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#44483e]">
            Logout jika Anda ingin masuk dengan akun lain.
          </p>
        </div>

        <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed] px-5 py-4">
          <p className="text-sm font-medium text-[#1a1c18]">
            Akun aktif: {session.username} ({roleLabels[session.role]})
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard">
              Dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "Mengakhiri sesi..." : "Logout"}
          </Button>
        </div>

        {error ? (
          <p className="rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label text-[#74796d]">Masuk</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
          Masuk ke akun Anda.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#44483e]">
          Masukkan email dan password Anda.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44483e]" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-[#44483e]"
            htmlFor="password"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      {feedback ? (
        <p className="rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] px-4 py-3 text-sm text-[#1a1c18]">
          {feedback}
        </p>
      ) : null}

      {error || sessionError ? (
        <p className="rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">
          {error ?? sessionError}
        </p>
      ) : null}

      <p className="text-sm leading-7 text-[#44483e]">
        Belum punya akun?{" "}
        <Link className="font-medium text-[#3f6901]" href="/register">
          Buat akun
        </Link>
        .
      </p>
    </div>
  );
}
