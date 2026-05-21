"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Filter,
  MapPinned,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabels, type AuthResponse } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { getNavigationForRole } from "@/modules/dashboard/data/navigation";
import {
  gardenBlocks,
  logisticsPins,
  logisticsStatus,
  overviewActions,
  overviewMetrics,
  overviewUsers,
  recentActivities,
} from "@/modules/dashboard/data/overview";
import { cn } from "@/lib/utils";

const toneStyles = {
  leaf: "bg-[#cdedae] text-[#2b4316]",
  field: "bg-[#ffe1c7] text-[#774e15]",
  sky: "bg-[#d5e8ff] text-[#24527a]",
  warning: "bg-[#ffdad6] text-[#ba1a1a]",
  danger: "bg-[#ffdad6] text-[#ba1a1a]",
} as const;

const mutedToneStyles = {
  leaf: "bg-[#f0f7e9] text-[#2b4316]",
  field: "bg-[#fff0e3] text-[#774e15]",
  sky: "bg-[#edf6ff] text-[#24527a]",
  warning: "bg-[#fff0ee] text-[#ba1a1a]",
  danger: "bg-[#fff0ee] text-[#ba1a1a]",
} as const;

function DashboardMetricCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {overviewMetrics.map(({ label, value, helper, tone, icon: Icon }) => (
        <section
          key={label}
          className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.01em] text-[#74796d]">
                {label}
              </p>
              <p className="mt-5 truncate text-3xl font-bold text-[#1a1c18]">
                {value}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#415b2b]">
                {helper}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-lg",
                toneStyles[tone],
              )}
            >
              <Icon className="size-5" />
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}

function ActionQueue({ session }: { session: AuthResponse }) {
  const allowedHrefs = new Set(
    getNavigationForRole(session.role).map((item) => item.href),
  );
  const availableActions = overviewActions.filter((item) =>
    allowedHrefs.has(item.href),
  );

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
            Perlu Ditindaklanjuti
          </h2>
          <p className="mt-1 text-sm text-[#74796d]">
            Prioritas pendek sesuai akses {roleLabels[session.role]}.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {availableActions.map(({ label, helper, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-[#c4c8ba]/70 bg-[#fffee1]/35 p-4 transition hover:border-[#3f6901]/50 hover:bg-white hover:shadow-[0_14px_30px_rgba(119,78,21,0.08)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-[#cdedae] text-[#2b4316]">
                <Icon className="size-4" />
              </span>
              <ArrowRight className="size-4 text-[#74796d] transition group-hover:translate-x-1 group-hover:text-[#2b4316]" />
            </div>
            <h3 className="mt-4 font-semibold text-[#1a1c18]">{label}</h3>
            <p className="mt-1 text-sm leading-6 text-[#44483e]">{helper}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TeamSnapshot({ session }: { session: AuthResponse }) {
  const canManageUsers = session.role === "ADMIN";

  return (
    <section className="overflow-hidden rounded-lg border border-[#c4c8ba]/70 bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#c4c8ba]/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
            Tim Lapangan
          </h2>
          <p className="mt-1 text-sm text-[#74796d]">
            Pantau user yang sedang aktif dan role operasionalnya.
          </p>
        </div>

        <div className="flex gap-3">
          <label className="relative min-w-0 flex-1 lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
            <span className="sr-only">Cari user</span>
            <input
              type="search"
              placeholder="Cari user..."
              className="h-10 w-full rounded-lg border border-[#c4c8ba] bg-[#f4f4ed] pl-10 pr-3 text-sm text-[#1a1c18] outline-none transition focus:border-[#3f6901] focus:ring-2 focus:ring-[#3f6901]/15"
            />
          </label>
          <button
            type="button"
            aria-label="Filter user"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#c4c8ba] bg-[#f4f4ed] text-[#1a1c18] transition hover:border-[#3f6901]/60 hover:text-[#2b4316]"
          >
            <Filter className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-[#f4f4ed] text-xs uppercase tracking-[0.01em] text-[#74796d]">
            <tr>
              <th className="px-5 py-3 font-bold">Nama</th>
              <th className="px-5 py-3 font-bold">Email</th>
              <th className="px-5 py-3 font-bold">Role</th>
              <th className="px-5 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4c8ba]/60">
            {overviewUsers.map((user) => (
              <tr key={user.email}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#d5e8ff] text-xs font-bold text-[#24527a]">
                      {user.initials}
                    </span>
                    <span className="font-semibold text-[#1a1c18]">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#44483e]">{user.email}</td>
                <td className="px-5 py-4">
                  <Badge variant="muted" className="normal-case">
                    {user.role}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2 font-medium text-[#1a1c18]">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        user.status === "Online" ? "bg-[#2b4316]" : "bg-[#74796d]",
                      )}
                    />
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#c4c8ba]/70 px-5 py-4">
        <p className="text-sm text-[#44483e]">Menampilkan 3 dari 842 user.</p>
        {canManageUsers ? (
          <Button asChild variant="secondary" size="sm">
            <Link href="/users">Kelola user</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function GardenManagement({ session }: { session: AuthResponse }) {
  const canOpenPlantations = getNavigationForRole(session.role).some(
    (item) => item.href === "/plantations",
  );

  return (
    <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
            Manajemen Blok
          </h2>
          <p className="mt-1 text-sm text-[#74796d]">
            Lihat blok yang aktif dipanen hari ini.
          </p>
        </div>
        {canOpenPlantations ? (
          <Button asChild size="sm">
            <Link href="/plantations">
              <Plus className="size-4" />
              Blok
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {gardenBlocks.map((block) => (
          <article
            key={block.name}
            className="rounded-lg border border-[#c4c8ba]/70 bg-[#fffee1]/35 p-4"
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "inline-flex size-16 shrink-0 items-center justify-center rounded-lg",
                  mutedToneStyles[block.tone],
                )}
              >
                <MapPinned className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#1a1c18]">{block.name}</h3>
                    <p className="mt-1 font-mono text-xs text-[#44483e]">
                      {block.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Opsi ${block.name}`}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[#74796d] transition hover:bg-white hover:text-[#1a1c18]"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </div>
                <dl className="mt-3 grid gap-1 text-sm text-[#44483e]">
                  <div className="flex justify-between gap-4">
                    <dt>Mandor</dt>
                    <dd className="font-semibold text-[#1a1c18]">
                      {block.mandor}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Estimasi panen</dt>
                    <dd className="font-semibold text-[#1a1c18]">
                      {block.harvest}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardContent({ session }: { session: AuthResponse }) {
  return (
    <div className="space-y-6">
      <DashboardMetricCards />
      <ActionQueue session={session} />
      <TeamSnapshot session={session} />
      <GardenManagement session={session} />
    </div>
  );
}

function DashboardAside() {
  const LogisticsIcon = logisticsStatus.icon;

  return (
    <>
      <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">
            Aktivitas Terbaru
          </h2>
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#f4f4ed] text-[#74796d]">
            <Clock3 className="size-4" />
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {recentActivities.map(({ title, helper, tone, icon: Icon }) => (
            <article key={`${title}-${helper}`} className="flex gap-3">
              <span
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                  toneStyles[tone],
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-5 text-[#1a1c18]">
                  {title}
                </p>
                <p className="mt-1 text-xs text-[#74796d]">{helper}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[#c4c8ba]/70 bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
        <div className="relative h-48 bg-[#243f32]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute inset-x-0 top-16 h-px rotate-[-12deg] bg-[#b1d094]/45" />
          <div className="absolute inset-y-0 left-1/3 w-px rotate-[18deg] bg-[#b1d094]/35" />
          <Badge className="absolute left-4 top-4 border-white bg-white text-[#1a1c18]">
            Logistik Live
          </Badge>
          {logisticsPins.map((pin) => (
            <span
              key={`${pin.left}-${pin.top}`}
              className="absolute size-3 rounded-full border-2 border-white bg-[#75d6ff] shadow-[0_0_0_6px_rgba(117,214,255,0.16)]"
              style={{ left: pin.left, top: pin.top }}
            />
          ))}
          <span className="absolute bottom-4 right-4 inline-flex size-12 items-center justify-center rounded-lg bg-[#cdedae] text-[#2b4316]">
            <LogisticsIcon className="size-5" />
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-sm font-bold uppercase tracking-[0.01em] text-[#1a1c18]">
            <span>Armada aktif</span>
            <span>{logisticsStatus.activeFleet}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efeee7]">
            <span
              className="block h-full rounded-full bg-[#2b4316]"
              style={{ width: `${logisticsStatus.completion}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-[#74796d]">
            Checkpoint berikutnya: {logisticsStatus.nextCheckpoint}.
          </p>
        </div>
      </section>
    </>
  );
}

export function DashboardPage() {
  return (
    <ProtectedRoute
      title="Overview"
      description="Pantau panen, tim, pengiriman, dan payroll dari satu halaman kerja."
      aside={<DashboardAside />}
    >
      {(session) => <DashboardContent session={session} />}
    </ProtectedRoute>
  );
}
