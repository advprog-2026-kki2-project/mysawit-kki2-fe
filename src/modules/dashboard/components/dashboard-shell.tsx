"use client";

import type { ReactNode } from "react";
import { Bell, Mail, Search } from "lucide-react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { AuthResponse } from "@/modules/auth/data/types";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";

type DashboardShellProps = {
  session: AuthResponse;
  title: string;
  description?: string;
  aside?: ReactNode | null;
  children: ReactNode;
};

export function DashboardShell({
  session,
  title,
  description,
  aside,
  children,
}: DashboardShellProps) {
  const shouldRenderAside = aside != null;

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
          </div>
        </header>

        <main
          className={
            shouldRenderAside
              ? "grid min-h-0 gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-7 xl:grid-cols-[minmax(0,1fr)_22rem]"
              : "grid min-h-0 gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-7"
          }
        >
          <section className="min-w-0 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
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

          {shouldRenderAside ? (
            <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
              {aside}
            </aside>
          ) : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
