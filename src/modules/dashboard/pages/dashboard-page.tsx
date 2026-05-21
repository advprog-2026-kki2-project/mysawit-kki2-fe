"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabels, type AuthResponse } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { getNavigationForRole } from "@/modules/dashboard/data/navigation";

function DashboardContent({ session }: { session: AuthResponse }) {
  const navigation = getNavigationForRole(session.role);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <section className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-white p-6 shadow-[0_2px_4px_rgba(13,13,13,0.03)]">
        <Badge>Dashboard</Badge>
        <h2 className="mt-5 max-w-2xl text-3xl font-semibold text-[#0d0d0d] sm:text-4xl">
          Selamat datang, {session.username}.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#666666]">
          Gunakan menu yang tersedia untuk role {roleLabels[session.role]}.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {navigation.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-[1.25rem] border border-[rgba(13,13,13,0.05)] bg-[#fbfdfc] p-5 transition-colors hover:border-[#18E299]/40 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex size-11 items-center justify-center rounded-full bg-[#d4fae8] text-[#0fa76e]">
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-[#888888] transition-transform group-hover:translate-x-1 group-hover:text-[#0fa76e]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#0d0d0d]">
                {label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#666666]">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-white p-6 shadow-[0_2px_4px_rgba(13,13,13,0.03)]">
        <div className="inline-flex size-11 items-center justify-center rounded-full bg-[#d4fae8] text-[#0fa76e]">
          <CheckCircle2 className="size-5" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-[#0d0d0d]">
          Sesi aktif
        </h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-[#888888]">Username</dt>
            <dd className="mt-1 font-medium text-[#0d0d0d]">
              {session.username}
            </dd>
          </div>
          <div>
            <dt className="text-[#888888]">Role</dt>
            <dd className="mt-1 font-medium text-[#0d0d0d]">
              {roleLabels[session.role]}
            </dd>
          </div>
        </dl>
        <Button asChild variant="secondary" className="mt-6 w-full">
          <Link href="/">Lihat beranda</Link>
        </Button>
      </aside>
    </div>
  );
}

export function DashboardPage() {
  return (
    <ProtectedRoute
      title="Dashboard"
      description="Akses menu disesuaikan dengan role akun yang sedang login."
    >
      {(session) => <DashboardContent session={session} />}
    </ProtectedRoute>
  );
}
