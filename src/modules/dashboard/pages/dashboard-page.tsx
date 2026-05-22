"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Filter,
  Leaf,
  MapPinned,
  MoreVertical,
  Plus,
  Search,
  Tractor,
  Truck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabels, type AuthResponse } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { getNavigationForRole } from "@/modules/dashboard/data/navigation";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "@/modules/dashboard/data/overview-api";
import { overviewActions } from "@/modules/dashboard/data/overview";
import { payrollStatusLabels } from "@/modules/payroll/data/types";
import { cn } from "@/lib/utils";

type Tone = "leaf" | "field" | "sky" | "warning" | "danger";

type Metric = {
  label: string;
  value: string;
  helper: string;
  tone: Tone;
  icon: LucideIcon;
};

const emptyOverview: DashboardOverview = {
  harvests: [],
  payrolls: [],
  plantations: [],
  transports: [],
  users: [],
  errors: [],
};

const toneStyles: Record<Tone, string> = {
  leaf: "bg-[#cdedae] text-[#2b4316]",
  field: "bg-[#ffe1c7] text-[#774e15]",
  sky: "bg-[#d5e8ff] text-[#24527a]",
  warning: "bg-[#ffdad6] text-[#ba1a1a]",
  danger: "bg-[#ffdad6] text-[#ba1a1a]",
};

const mutedToneStyles: Record<"leaf" | "field", string> = {
  leaf: "bg-[#f0f7e9] text-[#2b4316]",
  field: "bg-[#fff0e3] text-[#774e15]",
};

function formatKg(value: number) {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)} kg`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function getTotalHarvestKg(data: DashboardOverview) {
  const harvestWeight = data.harvests.reduce((total, item) => total + item.weightKg, 0);
  if (harvestWeight > 0) {
    return harvestWeight;
  }

  return data.transports.reduce((total, item) => total + item.totalWeight, 0);
}

function getPendingPayrollAmount(data: DashboardOverview) {
  return data.payrolls
    .filter((item) => item.status === "PENDING")
    .reduce((total, item) => total + Number(item.amount), 0);
}

function buildMetrics(data: DashboardOverview, session: AuthResponse): Metric[] {
  const activeWorkers =
    session.role === "ADMIN"
      ? data.users.filter((item) => item.role !== "ADMIN").length
      : data.users.length || 1;
  const pendingPayrolls = data.payrolls.filter((item) => item.status === "PENDING").length;
  const pendingHarvests = data.harvests.filter((item) => item.status === "PENDING").length;

  return [
    {
      label: "Total panen",
      value: formatKg(getTotalHarvestKg(data)),
      helper:
        data.harvests.length > 0
          ? `${data.harvests.length} log panen termuat`
          : "Berdasarkan delivery termuat",
      tone: "leaf",
      icon: Leaf,
    },
    {
      label: session.role === "ADMIN" ? "User operasional" : "Akses aktif",
      value: String(activeWorkers),
      helper: session.role === "ADMIN" ? "Selain admin" : roleLabels[session.role],
      tone: "field",
      icon: UsersRound,
    },
    {
      label: "Pengiriman aktif",
      value: String(data.transports.length),
      helper: `${data.transports.filter((item) => item.status === "ARRIVED").length} tiba di tujuan`,
      tone: "sky",
      icon: Truck,
    },
    {
      label: "Payroll pending",
      value: formatCurrency(getPendingPayrollAmount(data)),
      helper: `${pendingPayrolls} dari ${data.payrolls.length} payroll`,
      tone: pendingPayrolls > 0 || pendingHarvests > 0 ? "warning" : "leaf",
      icon: CircleDollarSign,
    },
  ];
}

function DashboardMetricCards({
  data,
  isLoading,
  session,
}: {
  data: DashboardOverview;
  isLoading: boolean;
  session: AuthResponse;
}) {
  const metrics = buildMetrics(data, session);

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {metrics.map(({ label, value, helper, tone, icon: Icon }) => (
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
                {isLoading ? "..." : value}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#415b2b]">
                {isLoading ? "Memuat data backend" : helper}
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

function ActionQueue({
  data,
  session,
}: {
  data: DashboardOverview;
  session: AuthResponse;
}) {
  const allowedHrefs = new Set(
    getNavigationForRole(session.role).map((item) => item.href),
  );
  const pendingHarvests = data.harvests.filter((item) => item.status === "PENDING").length;
  const arrivedTransports = data.transports.filter((item) => item.status === "ARRIVED").length;
  const pendingPayrolls = data.payrolls.filter((item) => item.status === "PENDING").length;
  const helperByHref: Record<string, string> = {
    "/harvest": `${pendingHarvests} log panen menunggu review.`,
    "/transport": `${arrivedTransports} pengiriman perlu verifikasi.`,
    "/payroll": `${pendingPayrolls} payroll masih pending.`,
  };
  const availableActions = overviewActions.filter((item) =>
    allowedHrefs.has(item.href),
  );

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div>
        <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
          Perlu Ditindaklanjuti
        </h2>
        <p className="mt-1 text-sm text-[#74796d]">
          Prioritas pendek dari data backend sesuai akses aktif.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {availableActions.map(({ label, href, icon: Icon }) => (
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
            <p className="mt-1 text-sm leading-6 text-[#44483e]">
              {helperByHref[href] ?? "Buka modul untuk detail."}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TeamSnapshot({
  data,
  session,
}: {
  data: DashboardOverview;
  session: AuthResponse;
}) {
  const canManageUsers = session.role === "ADMIN";
  if (!canManageUsers) {
    return null;
  }

  const rows = data.users.slice(0, 5).map((user) => ({
    email: user.email,
    name: user.username,
    role: roleLabels[user.role],
    status: user.role === "ADMIN" ? "Admin" : "Aktif",
  }));

  return (
    <section className="overflow-hidden rounded-lg border border-[#c4c8ba]/70 bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#c4c8ba]/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
            Tim Lapangan
          </h2>
          <p className="mt-1 text-sm text-[#74796d]">
            {canManageUsers
              ? "Data user diambil dari endpoint manajemen pengguna."
              : "Ringkasan sesi aktif untuk role ini."}
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
              disabled={!canManageUsers}
            />
          </label>
          <button
            type="button"
            aria-label="Filter user"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#c4c8ba] bg-[#f4f4ed] text-[#1a1c18] transition hover:border-[#3f6901]/60 hover:text-[#2b4316] disabled:opacity-50"
            disabled={!canManageUsers}
          >
            <Filter className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {rows.length > 0 ? (
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
              {rows.map((user) => (
                <tr key={`${user.email}-${user.name}`}>
                  <td className="px-5 py-4 font-semibold text-[#1a1c18]">
                    {user.name}
                  </td>
                  <td className="px-5 py-4 text-[#44483e]">{user.email}</td>
                  <td className="px-5 py-4">
                    <Badge variant="muted" className="normal-case">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 font-medium text-[#1a1c18]">
                      <span className="size-2 rounded-full bg-[#2b4316]" />
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-8 text-sm text-[#74796d]">
            Belum ada user operasional yang ditampilkan.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#c4c8ba]/70 px-5 py-4">
        <p className="text-sm text-[#44483e]">
          Menampilkan {rows.length} dari {Math.max(data.users.length, rows.length)} user.
        </p>
        {canManageUsers ? (
          <Button asChild variant="secondary" size="sm">
            <Link href="/users">Kelola user</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function GardenManagement({
  data,
  session,
}: {
  data: DashboardOverview;
  session: AuthResponse;
}) {
  const canOpenPlantations = getNavigationForRole(session.role).some(
    (item) => item.href === "/plantations",
  );
  if (!canOpenPlantations) {
    return null;
  }

  const blocks = data.plantations.slice(0, 4);

  return (
    <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
            Manajemen Blok
          </h2>
          <p className="mt-1 text-sm text-[#74796d]">
            {canOpenPlantations
              ? "Data blok diambil dari endpoint plantations."
              : "Buka modul terkait untuk melihat data blok lengkap."}
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

      {blocks.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {blocks.map((block, index) => (
            <article
              key={block.plantationId}
              className="rounded-lg border border-[#c4c8ba]/70 bg-[#fffee1]/35 p-4"
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "inline-flex size-16 shrink-0 items-center justify-center rounded-lg",
                    mutedToneStyles[index % 2 === 0 ? "leaf" : "field"],
                  )}
                >
                  <MapPinned className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#1a1c18]">
                        {block.plantationName}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-[#44483e]">
                        {block.plantationCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Opsi ${block.plantationName}`}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[#74796d] transition hover:bg-white hover:text-[#1a1c18]"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                  <dl className="mt-3 grid gap-1 text-sm text-[#44483e]">
                    <div className="flex justify-between gap-4">
                      <dt>Mandor</dt>
                      <dd className="font-semibold text-[#1a1c18]">
                        {block.assignedForemanIds.length}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Area</dt>
                      <dd className="font-semibold text-[#1a1c18]">
                        {block.areaHectares} ha
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-[#c4c8ba]/70 bg-[#f4f4ed] p-4 text-sm text-[#44483e]">
          Belum ada data plantation yang dapat ditampilkan untuk role ini.
        </p>
      )}
    </section>
  );
}

function DashboardErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] p-4 text-sm text-[#93000a]">
      <p className="font-semibold">Sebagian data backend belum termuat.</p>
      <ul className="mt-2 space-y-1">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </section>
  );
}

function DashboardContent({ session }: { session: AuthResponse }) {
  const [data, setData] = useState<DashboardOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      setIsLoading(true);
      const result = await getDashboardOverview(session);
      if (isMounted) {
        setData(result);
        setIsLoading(false);
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [session]);

  return (
    <div className="space-y-6">
      <DashboardErrors errors={data.errors} />
      <DashboardMetricCards data={data} isLoading={isLoading} session={session} />
      <ActionQueue data={data} session={session} />
      <TeamSnapshot data={data} session={session} />
      <GardenManagement data={data} session={session} />
    </div>
  );
}

function buildActivities(data: DashboardOverview) {
  const harvestActivities = data.harvests.slice(0, 2).map((item) => ({
    helper: item.harvestDate,
    icon: Leaf,
    title: `${item.laborerName} mengirim ${formatKg(item.weightKg)} panen.`,
    tone: item.status === "PENDING" ? "warning" : "leaf",
  }));
  const transportActivities = data.transports.slice(0, 2).map((item) => ({
    helper: item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "Tanggal tidak tersedia",
    icon: Truck,
    title: `Transport #${item.id} berstatus ${item.status}.`,
    tone: "field",
  }));
  const payrollActivities = data.payrolls.slice(0, 2).map((item) => ({
    helper: item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "Tanggal tidak tersedia",
    icon: CircleDollarSign,
    title: `${item.beneficiaryReference}: ${payrollStatusLabels[item.status]} ${formatCurrency(Number(item.amount))}.`,
    tone: item.status === "REJECTED" ? "danger" : "sky",
  }));

  return [...harvestActivities, ...transportActivities, ...payrollActivities].slice(0, 4);
}

function DashboardAside({ data }: { data: DashboardOverview }) {
  const activities = useMemo(() => buildActivities(data), [data]);
  const completion =
    data.transports.length > 0
      ? Math.round(
          (data.transports.filter((item) =>
            ["ARRIVED", "FOREMAN_APPROVED", "ADMIN_APPROVED"].includes(item.status),
          ).length /
            data.transports.length) *
            100,
        )
      : 0;

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
          {activities.length > 0 ? (
            activities.map(({ title, helper, tone, icon: Icon }) => (
              <article key={`${title}-${helper}`} className="flex gap-3">
                <span
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                    toneStyles[tone as Tone],
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
            ))
          ) : (
            <p className="text-sm leading-6 text-[#74796d]">
              Aktivitas akan muncul setelah data panen, transport, atau payroll tersedia.
            </p>
          )}
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
          {data.transports.slice(0, 4).map((transport, index) => (
            <span
              key={transport.id}
              className="absolute size-3 rounded-full border-2 border-white bg-[#75d6ff] shadow-[0_0_0_6px_rgba(117,214,255,0.16)]"
              style={{
                left: `${18 + index * 19}%`,
                top: `${32 + (index % 2) * 21}%`,
              }}
            />
          ))}
          <span className="absolute bottom-4 right-4 inline-flex size-12 items-center justify-center rounded-lg bg-[#cdedae] text-[#2b4316]">
            <Tractor className="size-5" />
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-sm font-bold uppercase tracking-[0.01em] text-[#1a1c18]">
            <span>Armada aktif</span>
            <span>{data.transports.length} unit</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efeee7]">
            <span
              className="block h-full rounded-full bg-[#2b4316]"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-[#74796d]">
            {completion}% pengiriman sudah tiba atau terverifikasi.
          </p>
        </div>
      </section>
    </>
  );
}

function DashboardWithAside({ session }: { session: AuthResponse }) {
  const [data, setData] = useState<DashboardOverview>(emptyOverview);

  useEffect(() => {
    let isMounted = true;
    void getDashboardOverview(session).then((result) => {
      if (isMounted) {
        setData(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [session]);

  return <DashboardAside data={data} />;
}

export function DashboardPage() {
  return (
    <ProtectedRoute
      title="Overview"
      description="Pantau panen, tim, pengiriman, dan payroll dari data backend."
      aside={(session) => <DashboardWithAside session={session} />}
    >
      {(session) => <DashboardContent session={session} />}
    </ProtectedRoute>
  );
}
