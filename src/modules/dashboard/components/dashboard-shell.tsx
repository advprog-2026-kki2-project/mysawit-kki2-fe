"use client";

import type { ReactNode } from "react";

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
  return (
    <SidebarProvider>
      <DashboardSidebar session={session} />
      <SidebarInset className="min-h-svh bg-[#fbfdfc]">
        <header className="sticky top-0 z-20 border-b border-[rgba(13,13,13,0.05)] bg-[#fbfdfc]/90 backdrop-blur-xl">
          <div className="flex min-h-18 items-center justify-between gap-4 px-5 py-3 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger />
              <div className="min-w-0">
                <p className="mono-label text-[#888888]">
                  {roleLabels[session.role]}
                </p>
                <h1 className="truncate text-xl font-semibold text-[#0d0d0d] sm:text-2xl">
                  {title}
                </h1>
              </div>
            </div>
            <div className="hidden rounded-full border border-[rgba(13,13,13,0.06)] bg-white px-4 py-2 text-sm font-medium text-[#333333] shadow-[0_1px_2px_rgba(13,13,13,0.03)] sm:block">
              {session.username}
            </div>
          </div>
          {description ? (
            <div className="border-t border-[rgba(13,13,13,0.04)] px-5 py-3 lg:px-8">
              <p className="max-w-3xl text-sm leading-6 text-[#666666]">
                {description}
              </p>
            </div>
          ) : null}
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
