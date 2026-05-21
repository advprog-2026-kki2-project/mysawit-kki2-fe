"use client";

import type { ReactNode } from "react";
import { Bell, Mail, Search, Sprout } from "lucide-react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { roleLabels, type AuthResponse } from "@/modules/auth/data/types";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";

type DashboardShellProps = {
  session: AuthResponse;
  title: string;
  description?: string;
  children: ReactNode;
};

export function DashboardShell({
  session,
  title,
  description,
  children,
}: DashboardShellProps) {
  const displayInitial = session.username.slice(0, 1).toUpperCase();

  return (
    <SidebarProvider className="min-h-svh bg-[#dadad3]">
      <DashboardSidebar session={session} />
      <SidebarInset className="min-h-svh bg-[#fafaf2] md:m-6 md:ml-0 md:overflow-hidden md:rounded-lg md:border md:border-[#c4c8ba]">
        <header className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-7">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />

            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
              <span className="sr-only">Cari</span>
              <input
                type="search"
                placeholder="Cari modul atau pekerjaan..."
                className="h-12 w-full rounded-lg border border-[#c4c8ba] bg-[#fffee1]/55 pl-11 pr-4 text-sm font-medium text-[#1a1c18] outline-none transition focus:border-2 focus:border-[#3f6901] focus:ring-4 focus:ring-[#3f6901]/10"
              />
            </label>

            <div className="hidden items-center gap-3 sm:flex">
              <button
                type="button"
                className="inline-flex size-12 items-center justify-center rounded-lg border border-[#c4c8ba] bg-white text-[#1a1c18] transition hover:border-[#2b4316]/40 hover:text-[#415b2b]"
                aria-label="Pesan"
              >
                <Mail className="size-4" />
              </button>
              <button
                type="button"
                className="inline-flex size-12 items-center justify-center rounded-lg border border-[#c4c8ba] bg-white text-[#1a1c18] transition hover:border-[#2b4316]/40 hover:text-[#415b2b]"
                aria-label="Notifikasi"
              >
                <Bell className="size-4" />
              </button>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-[#c4c8ba] bg-white px-2 py-2 sm:px-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#cdedae] text-sm font-semibold text-[#415b2b]">
                {displayInitial}
              </span>
              <span className="hidden max-w-32 truncate text-sm font-semibold text-[#1a1c18] lg:block">
                {session.username}
              </span>
            </div>
          </div>
        </header>

        <main className="grid min-h-0 gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-7 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.01em] text-[#74796d]">
                  {roleLabels[session.role]}
                </p>
                <h1 className="font-[var(--font-syne)] truncate text-2xl font-bold text-[#1a1c18] sm:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#44483e]">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {children}
          </section>

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">
                  Statistik
                </h2>
                <Sprout className="size-5 text-[#3f6901]" />
              </div>

              <div className="mt-6 flex flex-col items-center text-center">
                <div className="relative inline-flex size-32 items-center justify-center rounded-lg border-[10px] border-[#cdedae]">
                  <div className="absolute -right-2 top-5 rounded-full bg-[#774e15] px-2.5 py-1 text-xs font-semibold text-white">
                    32%
                  </div>
                  <span className="inline-flex size-20 items-center justify-center rounded-lg bg-[#cdedae] font-[var(--font-syne)] text-2xl font-bold text-[#2b4316]">
                    {displayInitial}
                  </span>
                </div>
                <h3 className="mt-5 font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                  Selamat bekerja, {session.username}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#74796d]">
                  Pantau pekerjaan sesuai akses role Anda.
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-[#efeee7] p-4">
                <div className="flex h-28 items-end justify-between gap-3">
                  {[34, 46, 33, 60, 31].map((value, index) => (
                    <span
                      key={`${value}-${index}`}
                      className="w-full rounded-t-lg bg-[#b1d094]"
                      style={{ height: `${value}%` }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs font-medium text-[#74796d]">
                  <span>Panen</span>
                  <span>Kirim</span>
                  <span>Gaji</span>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
              <h2 className="font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">Akun</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#74796d]">Username</dt>
                  <dd className="truncate font-semibold text-[#1a1c18]">
                    {session.username}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#74796d]">Role</dt>
                  <dd className="font-semibold text-[#2b4316]">
                    {roleLabels[session.role]}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
