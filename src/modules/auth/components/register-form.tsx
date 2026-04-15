"use client";

import Link from "next/link";
import { startTransition, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, logout, register } from "@/modules/auth/data/auth-api";
import { roleOptions, type Role } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";

function roleLabel(role: Role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("LABORER");
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
      const result = await register({ email, username, password, role });
      setFeedback(
        `${result.message} Akun ${result.username} siap dipakai untuk login.`
      );
      startTransition(() => {
        router.push("/login");
      });
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Registrasi gagal. Coba lagi.");
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
        <div className="h-12 animate-pulse rounded-full bg-[#f5f5f5]" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="space-y-6">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#d4fae8] text-[#0fa76e]">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="mono-label text-[#888888]">Akun Aktif</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
            Satu akun sudah sedang aktif.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#666666]">
            Saat ini kamu login sebagai {session.username} dengan role{" "}
            {roleLabel(session.role)}. Logout dulu jika ingin membuat akun lain
            dari sesi yang sama.
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
        <p className="mono-label text-[#888888]">Daftar</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Buat akun baru langsung dari frontend.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
          Form ini akan mengirim DTO registrasi ke backend melalui API auth yang
          sama dengan test backend.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#333333]" htmlFor="register-email">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            placeholder="nama@mysawit.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#333333]" htmlFor="username">
            Username
          </label>
          <Input
            id="username"
            type="text"
            placeholder="operator01"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#333333]" htmlFor="register-password">
            Password
          </label>
          <Input
            id="register-password"
            type="password"
            placeholder="Buat password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#333333]" htmlFor="role">
            Role
          </label>
          <Select value={role} onValueChange={(value) => setRole(value as Role)}>
            <SelectTrigger id="role" className="h-12 w-full px-5">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {roleLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mendaftarkan akun..." : "Daftar akun"}
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
        Sudah punya akun?{" "}
        <Link className="font-medium text-[#0fa76e]" href="/login">
          Masuk sekarang
        </Link>
        .
      </p>
    </div>
  );
}
