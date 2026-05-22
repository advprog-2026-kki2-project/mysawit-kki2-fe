"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { getXenditTopUp, getWallet } from "@/modules/payroll/data/payroll-api";
import {
  xenditTopUpStatusLabels,
  type Wallet,
  type XenditWalletTopUp,
} from "@/modules/payroll/data/types";

type XenditTopUpResultPageProps = {
  result: "success" | "failed";
};

const adminOnly = ["ADMIN"] as const satisfies readonly Role[];

export function XenditTopUpResultPage({ result }: XenditTopUpResultPageProps) {
  return (
    <ProtectedRoute
      allowedRoles={adminOnly}
      title="Wallet Top Up"
      description="Pantau status invoice Xendit dan saldo wallet admin."
    >
      <TopUpResultPanel result={result} />
    </ProtectedRoute>
  );
}

function TopUpResultPanel({ result }: XenditTopUpResultPageProps) {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const [payment, setPayment] = useState<XenditWalletTopUp | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadPayment() {
    if (!paymentId) {
      setError("Payment ID tidak ditemukan pada redirect Xendit.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [paymentResult, walletResult] = await Promise.all([
        getXenditTopUp(paymentId),
        getWallet(),
      ]);
      setPayment(paymentResult);
      setWallet(walletResult);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Status top up tidak dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const isPaid = payment?.status === "PAID";
  const isPending = payment?.status === "PENDING";
  const tone = isPaid
    ? "border-[#7aae44] bg-[#f4fbec] text-[#2b4316]"
    : result === "failed" || payment?.status === "FAILED" || payment?.status === "EXPIRED"
      ? "border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] text-[#93000a]"
      : "border-[#e4b576] bg-[#fff7ed] text-[#774e15]";
  const Icon = isPaid ? CheckCircle2 : isPending ? Clock3 : AlertCircle;
  const title = isPaid
    ? "Top up berhasil dikreditkan"
    : isPending
      ? "Pembayaran sedang diproses"
      : result === "success"
        ? "Menunggu konfirmasi Xendit"
        : "Top up belum berhasil";

  return (
    <section className="max-w-3xl rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className={`rounded-lg border p-5 ${tone}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/70">
              <Icon className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-1 text-sm">
                Saldo hanya berubah setelah webhook Xendit tervalidasi oleh backend.
              </p>
            </div>
          </div>
          {payment ? (
            <Badge variant="default" className="bg-white text-[#1a1c18]">
              {xenditTopUpStatusLabels[payment.status]}
            </Badge>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm font-medium text-[#93000a]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[rgba(116,121,109,0.18)] bg-[#f4f4ed] p-4">
          <p className="mono-label text-[#74796d]">Top Up Amount</p>
          <p className="mt-2 text-2xl font-bold text-[#1a1c18]">
            {formatRupiah(payment?.rupiahAmount ?? 0)}
          </p>
          <p className="mt-1 text-sm text-[#74796d]">
            {formatCurrency(payment?.walletAmount ?? 0)} SawitDollar
          </p>
        </div>
        <div className="rounded-lg border border-[rgba(116,121,109,0.18)] bg-[#f4f4ed] p-4">
          <p className="mono-label text-[#74796d]">Admin Wallet</p>
          <p className="mt-2 text-2xl font-bold text-[#1a1c18]">
            {formatCurrency(wallet?.balance ?? 0)}
          </p>
          <p className="mt-1 text-sm text-[#74796d]">
            {formatRupiah(wallet?.rupiahEquivalent ?? 0)}
          </p>
        </div>
      </div>

      {payment ? (
        <dl className="mt-5 grid gap-3 rounded-lg border border-[rgba(116,121,109,0.18)] p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[#74796d]">Payment ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-[#1a1c18]">{payment.id}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#74796d]">External ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-[#1a1c18]">{payment.externalId}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#74796d]">Method</dt>
            <dd className="mt-1 text-[#1a1c18]">{payment.paymentMethod ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#74796d]">Channel</dt>
            <dd className="mt-1 text-[#1a1c18]">{payment.paymentChannel ?? "-"}</dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => void loadPayment()} disabled={isLoading}>
          <RefreshCcw className={isLoading ? "size-4 animate-spin" : "size-4"} />
          Refresh Status
        </Button>
        <Button asChild>
          <Link href="/payroll">
            <WalletCards className="size-4" />
            Back to Payroll
          </Link>
        </Button>
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
