"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  ClipboardList,
  HelpCircle,
  History,
  Map,
  RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthResponse, Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { ForemanHarvestReview } from "@/modules/harvest/components/foreman-harvest-review";
import { HarvestHistoryPanel } from "@/modules/harvest/components/harvest-history-panel";
import { HarvestSubmitForm } from "@/modules/harvest/components/harvest-submit-form";
import type { HarvestRecord } from "@/modules/harvest/data/types";
import { getPayrolls } from "@/modules/payroll/data/payroll-api";
import {
  payrollStatusLabels,
  type Payroll,
} from "@/modules/payroll/data/types";

const allowedRoles = ["LABORER", "FOREMAN"] as const satisfies readonly Role[];

function greeting() {
  const hour = new Date().getHours();

  if (hour < 11) {
    return "Selamat pagi";
  }

  if (hour < 15) {
    return "Selamat siang";
  }

  if (hour < 19) {
    return "Selamat sore";
  }

  return "Selamat malam";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatPayrollPeriod(payroll: Payroll) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(new Date(payroll.createdAt));
}

function localTodayIso() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function LaborerHarvestWorkspace({ session }: { session: AuthResponse }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [payrollError, setPayrollError] = useState<string | null>(null);
  const [isPayrollLoading, setIsPayrollLoading] = useState(false);

  const pendingReportCount = records.filter((record) => record.status === "PENDING").length;
  const todayRecord = records.find(
    (record) => record.harvestDate === localTodayIso(),
  );
  const totalHarvestKg = records.reduce((total, record) => total + record.weightKg, 0);
  const acceptedPayrollAmount = payrolls
    .filter((payroll) => payroll.status === "ACCEPTED")
    .reduce((total, payroll) => total + Number(payroll.amount), 0);
  const recentPayrolls = payrolls.slice(0, 2);
  const nextPendingPayroll = payrolls.find((payroll) => payroll.status === "PENDING");
  const nextPayrollLabel = nextPendingPayroll
    ? formatPayrollPeriod(nextPendingPayroll)
    : "Belum ada pending payroll";

  const quickTools = useMemo(
    () => [
      {
        href: "#history",
        icon: History,
        label: "History",
      },
      {
        href: "/payroll",
        icon: CircleDollarSign,
        label: "Payroll",
      },
      {
        href: "#report-harvest",
        icon: ClipboardList,
        label: "Report",
      },
      {
        href: "/dashboard",
        icon: Map,
        label: "Overview",
      },
    ],
    [],
  );

  async function loadPayrolls() {
    setIsPayrollLoading(true);
    setPayrollError(null);

    try {
      setPayrolls(
        await getPayrolls({
          beneficiaryReference: session.username,
          status: "ALL",
        }),
      );
    } catch (caughtError) {
      setPayrollError(
        caughtError instanceof Error
          ? caughtError.message
          : "Payroll tidak dapat dimuat.",
      );
    } finally {
      setIsPayrollLoading(false);
    }
  }

  useEffect(() => {
    void loadPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.username]);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 space-y-5">
        <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-[var(--font-syne)] text-2xl font-bold text-[#1a1c18]">
                {greeting()}, {session.username}
              </h2>
              <p className="mt-1 text-sm text-[#74796d]">
                Total panen tercatat: {totalHarvestKg.toLocaleString("id-ID")} kg
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <a href="#report-harvest">
                <ClipboardList className="size-4" />
                {pendingReportCount} pending report
              </a>
            </Button>
          </div>
        </section>

        <div id="report-harvest">
          <HarvestSubmitForm
            isTodaySubmitted={Boolean(todayRecord)}
            todaySubmittedStatus={todayRecord?.status ?? null}
            onSubmitted={() => {
              setRefreshKey((current) => current + 1);
              void loadPayrolls();
            }}
          />
        </div>

        <div id="history">
          <HarvestHistoryPanel
            refreshKey={refreshKey}
            onRecordsLoaded={setRecords}
          />
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-lg bg-[#203b28] p-5 text-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-white/65">
              Payroll diterima
            </p>
            <CircleDollarSign className="size-4 text-white/80" />
          </div>
          <p className="mt-5 text-3xl font-bold">
            {formatCurrency(acceptedPayrollAmount)}
          </p>
          <p className="mt-6 border-t border-white/15 pt-4 text-xs font-bold uppercase text-white/65">
            Pending berikutnya: {nextPayrollLabel}
          </p>
        </section>

        <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">
              Recent Payroll
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              disabled={isPayrollLoading}
              onClick={() => void loadPayrolls()}
              aria-label="Muat ulang payroll"
            >
              <RefreshCcw className="size-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {recentPayrolls.length > 0 ? (
              recentPayrolls.map((payroll) => (
                <Link
                  key={payroll.id}
                  href="/payroll"
                  className="block rounded-lg border border-[#c4c8ba]/70 bg-[#f4f4ed] px-3 py-3 transition hover:border-[#3f6901]/60"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-[#1a1c18]">
                      {payrollStatusLabels[payroll.status]}
                    </span>
                    <span className="font-bold text-[#1a1c18]">
                      {formatCurrency(Number(payroll.amount))}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#74796d]">
                    {formatPayrollPeriod(payroll)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-[#c4c8ba] px-3 py-5 text-sm text-[#74796d]">
                Belum ada payroll untuk akun ini.
              </p>
            )}
          </div>

          {payrollError ? (
            <p className="mt-3 rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]">
              {payrollError}
            </p>
          ) : null}

          <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
            <Link href="/payroll">View full history</Link>
          </Button>
        </section>

        <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <h2 className="font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">
            Field Quick Tools
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {quickTools.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-[#c4c8ba]/70 bg-[#f4f4ed] text-center text-xs font-bold uppercase text-[#1a1c18] transition hover:border-[#3f6901]/60 hover:bg-white"
              >
                <Icon className="mb-2 size-5 text-[#774e15]" />
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#c4c8ba]/70 bg-white p-5 text-sm text-[#44483e] shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="flex gap-3">
            <HelpCircle className="mt-0.5 size-4 shrink-0 text-[#774e15]" />
            <p>
              Satu akun hanya bisa mengirim satu laporan untuk tanggal yang sama.
            </p>
          </div>
        </section>
      </aside>
    </section>
  );
}

export function HarvestPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Panen"
      description="Buruh mengirim panen harian, mandor melakukan validasi hasil panen."
      aside={null}
    >
      {(session) =>
        session.role === "LABORER" ? (
          <LaborerHarvestWorkspace session={session} />
        ) : (
          <ForemanHarvestReview />
        )
      }
    </ProtectedRoute>
  );
}
