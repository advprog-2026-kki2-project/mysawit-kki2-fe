"use client";

import Link from "next/link";
import { startTransition, useState, type FormEvent } from "react";
import { ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, login, logout } from "@/modules/auth/data/auth-api";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { session, isLoading, error: sessionError, refreshSession } = useAuthSession();

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
        router.push("/");
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
        <div className="h-6 w-32 animate-pulse rounded-full bg-[#f5f5f5]" />
        <div className="h-12 animate-pulse rounded-full bg-[#f5f5f5]" />
        <div className="h-12 animate-pulse rounded-full bg-[#f5f5f5]" />
        <div className="h-12 animate-pulse rounded-full bg-[#f5f5f5]" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="space-y-6">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#d4fae8] text-[#0fa76e]">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="mono-label text-[#888888]">Sesi Aktif</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
            Kamu sudah masuk sebagai {session.username}.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#666666]">
            Role aktif saat ini adalah {roleLabel(session.role)}. Kamu bisa
            kembali ke landing page atau logout untuk masuk dengan akun lain.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-[#fcfffe] px-5 py-4">
          <p className="text-sm font-medium text-[#0d0d0d]">{session.message}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              Kembali ke beranda
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
          <p className="rounded-[1.3rem] border border-[rgba(212,86,86,0.25)] bg-[rgba(212,86,86,0.06)] px-4 py-3 text-sm text-[#a54141]">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label text-[#888888]">Masuk</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Gunakan akun yang sudah terdaftar.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
          Frontend akan memanggil API backend dan menyimpan sesi login melalui
          cookie session backend.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#333333]" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="laborer@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#333333]" htmlFor="password">
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
          {isSubmitting ? "Memproses login..." : "Masuk"}
        </Button>
      </form>

      {feedback ? (
        <p className="rounded-[1.3rem] border border-[rgba(24,226,153,0.18)] bg-[rgba(212,250,232,0.55)] px-4 py-3 text-sm text-[#0d0d0d]">
          {feedback}
        </p>
      ) : null}

      {error || sessionError ? (
        <p className="rounded-[1.3rem] border border-[rgba(212,86,86,0.25)] bg-[rgba(212,86,86,0.06)] px-4 py-3 text-sm text-[#a54141]">
          {error ?? sessionError}
        </p>
      ) : null}

      <p className="text-sm leading-7 text-[#666666]">
        Belum punya akun?{" "}
        <Link className="font-medium text-[#0fa76e]" href="/register">
          Daftar di frontend
        </Link>
        .
      </p>
    </div>
  );
}
