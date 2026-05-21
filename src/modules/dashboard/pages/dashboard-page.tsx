"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { roleLabels, type AuthResponse } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { getNavigationForRole } from "@/modules/dashboard/data/navigation";

function DashboardContent({ session }: { session: AuthResponse }) {
  const navigation = getNavigationForRole(session.role);
  const visibleModules = navigation.filter((item) => item.href !== "/dashboard");
  const primaryModule = visibleModules.at(0) ?? navigation[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-[linear-gradient(135deg,#415B2B,#80B048)] p-6 text-white shadow-[0_18px_44px_rgba(119,78,21,0.08)] sm:p-8">
        <p className="text-sm font-semibold uppercase text-white/75">
          Operasional Sawit
        </p>
        <h2 className="mt-4 max-w-3xl font-[var(--font-syne)] text-3xl font-bold leading-tight sm:text-4xl">
          Kelola pekerjaan harian dengan akses {roleLabels[session.role]}.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
          Buka modul yang tersedia untuk memantau panen, pengiriman, pengguna,
          dan payroll sesuai role akun.
        </p>
        <Button
          asChild
          variant="secondary"
          className="mt-7 border-white bg-white text-[#1a1c18] hover:border-white hover:bg-[#fffee1] hover:text-[#415b2b]"
        >
          <Link href={primaryModule.href}>
            Buka {primaryModule.label}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            label: "Modul aktif",
            value: visibleModules.length,
            icon: Layers3,
          },
          {
            label: "Role",
            value: roleLabels[session.role],
            icon: CheckCircle2,
          },
          {
            label: "Status",
            value: "Siap",
            icon: Clock3,
          },
        ].map(({ label, value, icon: Icon }) => (
          <section
            key={label}
            className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex size-12 items-center justify-center rounded-lg bg-[#cdedae] text-[#2b4316]">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm text-[#74796d]">{label}</p>
                <p className="mt-1 text-xl font-semibold text-[#1a1c18]">
                  {value}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
              Modul Tersedia
            </h2>
            <p className="mt-1 text-sm text-[#74796d]">
              Menu disesuaikan dengan akses akun.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {visibleModules.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-[#c4c8ba]/70 bg-[#fffee1]/35 p-5 transition hover:border-[#3f6901]/50 hover:bg-white hover:shadow-[0_14px_30px_rgba(119,78,21,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-lg bg-[#cdedae] text-[#2b4316]">
                  <Icon className="size-5" />
                </span>
                <ArrowRight className="size-4 text-[#74796d] transition group-hover:translate-x-1 group-hover:text-[#2b4316]" />
              </div>
              <h3 className="mt-5 font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">
                {label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#44483e]">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>
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
