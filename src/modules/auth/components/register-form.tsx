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
import {
  roleLabels,
  selfRegistrationRoleOptions,
  type Role,
} from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";

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
        <div className="h-6 w-32 animate-pulse rounded-full bg-[#e3e3dc]" />
        <div className="h-12 animate-pulse rounded-full bg-[#e3e3dc]" />
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
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="mono-label text-[#74796d]">Sesi Aktif</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
            Anda sudah masuk.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#44483e]">
            Logout jika Anda ingin membuat akun lain.
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
        <p className="mono-label text-[#74796d]">Daftar</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
          Buat akun.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#44483e]">
          Semua field wajib diisi.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44483e]" htmlFor="register-email">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44483e]" htmlFor="username">
            Username
          </label>
          <Input
            id="username"
            type="text"
            placeholder="mis. budi.sawit"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44483e]" htmlFor="register-password">
            Password
          </label>
          <Input
            id="register-password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44483e]" htmlFor="role">
            Role
          </label>
          <Select value={role} onValueChange={(value) => setRole(value as Role)}>
            <SelectTrigger id="role" className="h-12 w-full px-5">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              {selfRegistrationRoleOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {roleLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Membuat akun..." : "Buat akun"}
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
        Sudah punya akun?{" "}
        <Link className="font-medium text-[#3f6901]" href="/login">
          Masuk
        </Link>
        .
      </p>
    </div>
  );
}
