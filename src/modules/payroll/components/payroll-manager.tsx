"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, CreditCard, RefreshCcw, Save, WalletCards, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/modules/auth/data/auth-api";
import type { AuthResponse } from "@/modules/auth/data/types";
import {
  acceptPayroll,
  getWallet,
  getWalletTransactions,
  getPayrolls,
  getWageConfiguration,
  rejectPayroll,
  saveWageConfiguration,
  topUpWallet,
} from "@/modules/payroll/data/payroll-api";
import {
  payrollStatusLabels,
  payrollStatusOptions,
  type Payroll,
  type PayrollStatus,
  type Wallet,
  type WalletTransaction,
} from "@/modules/payroll/data/types";

type PayrollManagerProps = {
  session: AuthResponse;
};

export function PayrollManager({ session }: PayrollManagerProps) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [beneficiaryReference, setBeneficiaryReference] = useState(
    session.role === "ADMIN" ? "" : session.username,
  );
  const [status, setStatus] = useState<PayrollStatus | "ALL">("ALL");
  const [date, setDate] = useState("");
  const [laborerWage, setLaborerWage] = useState("");
  const [driverWage, setDriverWage] = useState("");
  const [foremanWage, setForemanWage] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadWages() {
    try {
      const wages = await getWageConfiguration();
      setLaborerWage(String(wages.laborerWagePerKg));
      setDriverWage(String(wages.driverWagePerKg));
      setForemanWage(String(wages.foremanWagePerKg));
    } catch {
      setLaborerWage("");
      setDriverWage("");
      setForemanWage("");
    }
  }

  async function loadPayrolls() {
    setIsLoading(true);
    setError(null);
    try {
      setPayrolls(await getPayrolls({ beneficiaryReference, status, date }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Payroll tidak dapat dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadWallet() {
    try {
      const [walletResult, transactionResult] = await Promise.all([
        getWallet(),
        getWalletTransactions(),
      ]);
      setWallet(walletResult);
      setTransactions(transactionResult);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Wallet tidak dapat dimuat.");
    }
  }

  useEffect(() => {
    if (session.role === "ADMIN") {
      void loadWages();
    }
    void loadWallet();
    void loadPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveWages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await saveWageConfiguration({
        laborerWagePerKg: Number(laborerWage),
        driverWagePerKg: Number(driverWage),
        foremanWagePerKg: Number(foremanWage),
      });
      setFeedback("Konfigurasi upah berhasil disimpan.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Konfigurasi upah gagal disimpan.");
    }
  }

  async function handleTopUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await topUpWallet(Number(topUpAmount));
      setTopUpAmount("");
      setFeedback("Saldo wallet berhasil ditambahkan melalui sandbox gateway.");
      await loadWallet();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Top up gagal diproses.");
    }
  }

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPayrolls();
  }

  async function handleAccept(payroll: Payroll) {
    await acceptPayroll(payroll.id);
    setFeedback(`Payroll ${payroll.id} disetujui.`);
    await loadWallet();
    await loadPayrolls();
  }

  async function handleReject(payroll: Payroll) {
    const reason = rejectReasons[payroll.id]?.trim();
    if (!reason) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    await rejectPayroll(payroll.id, reason);
    setFeedback(`Payroll ${payroll.id} ditolak.`);
    await loadPayrolls();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <p className="mono-label text-[#74796d]">Wallet</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold text-[#1a1c18]">
                {formatCurrency(wallet?.balance ?? 0)} SawitDollar
              </p>
              <p className="mt-1 text-sm text-[#74796d]">
                Setara {formatRupiah(wallet?.rupiahEquivalent ?? 0)}
              </p>
            </div>
            <WalletCards className="size-8 text-[#0f3d2e]" />
          </div>
          {session.role === "ADMIN" ? (
            <form className="mt-5 flex gap-2" onSubmit={handleTopUp}>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={topUpAmount}
                onChange={(event) => setTopUpAmount(event.target.value)}
                placeholder="Jumlah top up"
                required
              />
              <Button type="submit">
                <CreditCard className="size-4" />
                Top Up
              </Button>
            </form>
          ) : null}
        </div>

        <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <p className="mono-label text-[#74796d]">Transaksi Terakhir</p>
          <div className="mt-4 space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-start justify-between gap-3 border-b border-[rgba(116,121,109,0.18)] pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-[#1a1c18]">{transaction.description}</p>
                  <p className="mt-1 text-xs text-[#74796d]">{formatDateTime(transaction.createdAt)}</p>
                </div>
                <p className={transaction.amount < 0 ? "text-sm font-semibold text-[#93000a]" : "text-sm font-semibold text-[#0f3d2e]"}>
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
            {transactions.length === 0 ? (
              <p className="text-sm text-[#74796d]">Belum ada transaksi wallet.</p>
            ) : null}
          </div>
        </div>
      </section>

      {session.role === "ADMIN" ? (
        <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <p className="mono-label text-[#74796d]">Wage Config</p>
          <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleSaveWages}>
            <Input type="number" step="0.01" value={laborerWage} onChange={(event) => setLaborerWage(event.target.value)} placeholder="Upah buruh/kg" required />
            <Input type="number" step="0.01" value={driverWage} onChange={(event) => setDriverWage(event.target.value)} placeholder="Upah supir/kg" required />
            <Input type="number" step="0.01" value={foremanWage} onChange={(event) => setForemanWage(event.target.value)} placeholder="Upah mandor/kg" required />
            <Button type="submit">
              <Save className="size-4" />
              Simpan
            </Button>
          </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
        <div>
          <p className="mono-label text-[#74796d]">Payroll</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#1a1c18]">
            Daftar payroll.
          </h2>
        </div>

        <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_12rem_12rem_auto]" onSubmit={handleFilter}>
          <Input
            value={beneficiaryReference}
            onChange={(event) => setBeneficiaryReference(event.target.value)}
            placeholder="Beneficiary reference"
          />
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="Tanggal payroll"
          />
          <Select value={status} onValueChange={(value) => setStatus(value as PayrollStatus | "ALL")}>
            <SelectTrigger className="h-12 w-full px-5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua status</SelectItem>
              {payrollStatusOptions.map((item) => (
                <SelectItem key={item} value={item}>{payrollStatusLabels[item]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isLoading}>
            <RefreshCcw className="size-4" />
            {isLoading ? "Memuat..." : "Filter"}
          </Button>
        </form>

        {feedback ? <p className="mt-4 rounded-lg bg-[#cdedae] px-4 py-3 text-sm">{feedback}</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">{error}</p> : null}

        <div className="mt-6 grid gap-4">
          {payrolls.map((payroll) => (
            <article key={payroll.id} className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed] p-4">
              <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
                <div>
                  <p className="text-sm font-semibold text-[#1a1c18]">
                    {payroll.beneficiaryReference} · {payroll.amount} SawitDollar
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#44483e]">{payroll.description}</p>
                  <p className="mt-2 text-xs font-medium text-[#74796d]">
                    {payroll.recipientRole} · {payrollStatusLabels[payroll.status]}
                  </p>
                  {payroll.rejectionReason ? (
                    <p className="mt-2 text-sm text-[#93000a]">{payroll.rejectionReason}</p>
                  ) : null}
                </div>
                {session.role === "ADMIN" ? (
                  <div className="space-y-2">
                    <Textarea
                      value={rejectReasons[payroll.id] ?? ""}
                      onChange={(event) => setRejectReasons((current) => ({ ...current, [payroll.id]: event.target.value }))}
                      placeholder="Alasan penolakan"
                      className="min-h-20 rounded-[1rem]"
                      disabled={payroll.status !== "PENDING"}
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" disabled={payroll.status !== "PENDING"} onClick={() => void handleAccept(payroll)}>
                        <Check className="size-4" />
                        Accept
                      </Button>
                      <Button type="button" size="sm" variant="secondary" disabled={payroll.status !== "PENDING"} onClick={() => void handleReject(payroll)}>
                        <X className="size-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
