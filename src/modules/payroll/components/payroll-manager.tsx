"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Banknote,
  Calculator,
  Check,
  CreditCard,
  ExternalLink,
  Filter,
  History,
  Hourglass,
  LoaderCircle,
  RefreshCcw,
  Save,
  Scale,
  ShieldCheck,
  Truck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { AuthResponse, Role } from "@/modules/auth/data/types";
import {
  acceptPayroll,
  createXenditTopUp,
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
  xenditTopUpStatusLabels,
  type Payroll,
  type PayrollStatus,
  type Wallet,
  type WalletTransaction,
  type XenditWalletTopUp,
} from "@/modules/payroll/data/types";

type PayrollManagerProps = {
  session: AuthResponse;
};

type PersonalPayrollRole = Exclude<Role, "ADMIN">;

const rolePayrollCopy = {
  LABORER: {
    title: "Upah Panen Saya",
    description: "Lihat upah dari hasil panen yang sudah divalidasi mandor.",
    weightLabel: "Kg panen",
    sourceLabel: "Sumber panen",
    walletLabel: "Wallet Buruh",
  },
  FOREMAN: {
    title: "Upah Verifikasi Pengiriman",
    description: "Lihat upah dari pengiriman yang sudah diakui admin.",
    weightLabel: "Kg diakui",
    sourceLabel: "Pengiriman",
    walletLabel: "Wallet Mandor",
  },
  DRIVER: {
    title: "Upah Pengiriman Saya",
    description: "Lihat upah dari pengiriman yang sudah disetujui mandor.",
    weightLabel: "Kg dikirim",
    sourceLabel: "Pengiriman",
    walletLabel: "Wallet Supir",
  },
} as const satisfies Record<
  PersonalPayrollRole,
  {
    title: string;
    description: string;
    weightLabel: string;
    sourceLabel: string;
    walletLabel: string;
  }
>;

export function PayrollManager({ session }: PayrollManagerProps) {
  const isAdmin = session.role === "ADMIN";
  const roleCopy = isAdmin ? null : rolePayrollCopy[session.role as PersonalPayrollRole];
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [beneficiaryReference, setBeneficiaryReference] = useState(
    isAdmin ? "" : session.username,
  );
  const effectiveBeneficiaryReference = isAdmin
    ? beneficiaryReference
    : session.username;
  const [status, setStatus] = useState<PayrollStatus | "ALL">("ALL");
  const [date, setDate] = useState("");
  const [laborerWage, setLaborerWage] = useState("");
  const [driverWage, setDriverWage] = useState("");
  const [foremanWage, setForemanWage] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [latestXenditTopUp, setLatestXenditTopUp] =
    useState<XenditWalletTopUp | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTopUp, setIsCreatingTopUp] = useState(false);
  const pendingPayrolls = payrolls.filter((payroll) => payroll.status === "PENDING");
  const acceptedPayrolls = payrolls.filter((payroll) => payroll.status === "ACCEPTED");
  const rejectedPayrolls = payrolls.filter((payroll) => payroll.status === "REJECTED");
  const totalAcceptedAmount = acceptedPayrolls.reduce(
    (total, payroll) => total + Number(payroll.amount),
    0,
  );
  const totalPendingAmount = pendingPayrolls.reduce(
    (total, payroll) => total + Number(payroll.amount),
    0,
  );
  const totalWeight = payrolls.reduce(
    (total, payroll) => total + Number(payroll.weightKg),
    0,
  );
  const wageCards = [
    {
      key: "laborer",
      label: "Upah Buruh Panen",
      value: laborerWage,
      helper: "90% applied",
      icon: UserRound,
      tone: "bg-[#e7f4dc] text-[#2b4316]",
    },
    {
      key: "driver",
      label: "Upah Supir Truk",
      value: driverWage,
      helper: "90% applied",
      icon: Truck,
      tone: "bg-[#f8e6dc] text-[#774e15]",
    },
    {
      key: "foreman",
      label: "Upah Mandor",
      value: foremanWage,
      helper: "90% applied",
      icon: ShieldCheck,
      tone: "bg-[#e9e8e1] text-[#44483e]",
    },
  ];

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
      const result = await getPayrolls({
        beneficiaryReference: effectiveBeneficiaryReference,
        status,
        date,
      });
      setPayrolls(
        isAdmin
          ? result
          : result.filter(
              (payroll) => payroll.beneficiaryReference === session.username,
            ),
      );
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
    if (isAdmin) {
      void loadWages();
    }
    setBeneficiaryReference(isAdmin ? "" : session.username);
    void loadWallet();
    void loadPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.role, session.username]);

  async function handleSaveWages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    setFeedback(null);
    setError(null);
    setIsCreatingTopUp(true);
    try {
      const payment = await createXenditTopUp(Number(topUpAmount));
      setLatestXenditTopUp(payment);
      setTopUpAmount("");
      setFeedback("Invoice Xendit dibuat. Anda akan diarahkan ke halaman pembayaran.");
      if (!payment.invoiceUrl) {
        throw new Error("Invoice URL Xendit tidak tersedia.");
      }
      window.location.assign(payment.invoiceUrl);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Top up gagal diproses.");
    } finally {
      setIsCreatingTopUp(false);
    }
  }

  async function handleManualTopUp() {
    if (!isAdmin) return;
    setFeedback(null);
    setError(null);
    setIsCreatingTopUp(true);
    try {
      await topUpWallet(Number(topUpAmount));
      setTopUpAmount("");
      setFeedback("Saldo wallet berhasil ditambahkan secara manual.");
      await loadWallet();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Top up manual gagal diproses.");
    } finally {
      setIsCreatingTopUp(false);
    }
  }

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPayrolls();
  }

  async function handleAccept(payroll: Payroll) {
    if (!isAdmin) return;
    await acceptPayroll(payroll.id);
    setFeedback(`Payroll ${payroll.id} disetujui.`);
    await loadWallet();
    await loadPayrolls();
  }

  async function handleReject(payroll: Payroll) {
    if (!isAdmin) return;
    const reason = rejectReasons[payroll.id]?.trim();
    if (!reason) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    await rejectPayroll(payroll.id, reason);
    setFeedback(`Payroll ${payroll.id} ditolak.`);
    await loadPayrolls();
  }

  async function handleApproveAll() {
    if (!isAdmin) return;
    for (const payroll of pendingPayrolls) {
      await acceptPayroll(payroll.id);
    }

    setFeedback(`${pendingPayrolls.length} payroll pending disetujui.`);
    await loadWallet();
    await loadPayrolls();
  }

  function renderAdminWageConfiguration() {
    return (
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#1a1c18]">Base Rate Variables</h2>
            <p className="mt-1 text-sm text-[#74796d]">Konfigurasi upah per kilogram untuk payroll periode berjalan.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => void loadWages()}>
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>

        <form className="mt-4 grid gap-4 lg:grid-cols-3" onSubmit={handleSaveWages}>
          {wageCards.map((item) => {
            const Icon = item.icon;
            const valueSetter = item.key === "laborer"
              ? setLaborerWage
              : item.key === "driver"
                ? setDriverWage
                : setForemanWage;

            return (
              <article key={item.key} className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex size-10 items-center justify-center rounded-lg ${item.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <Badge variant="default" className="px-2 py-0.5 text-[0.65rem]">Active</Badge>
                </div>
                <label className="mt-5 block">
                  <span className="mono-label text-[#74796d]">{item.label}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-[#a4a79f]">Rp</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.value}
                      onChange={(event) => valueSetter(event.target.value)}
                      className="h-11 border-0 bg-transparent px-0 text-3xl font-bold text-[#1a1c18] shadow-none focus-visible:ring-0"
                      required
                    />
                  </span>
                </label>
                <div className="mt-5 flex items-center justify-between border-t border-[rgba(116,121,109,0.16)] pt-3">
                  <span className="mono-label text-[0.65rem] text-[#74796d]">{item.helper}</span>
                  <span className="text-sm font-bold text-[#1a1c18]">
                    Rp {formatCurrency(Number(item.value || 0) * 0.9)} /kg
                  </span>
                </div>
              </article>
            );
          })}
          <div className="lg:col-span-3">
            <Button type="submit">
              <Save className="size-4" />
              Simpan Variabel Upah
            </Button>
          </div>
        </form>
      </section>
    );
  }

  function renderPersonalSummary() {
    if (!roleCopy) return null;

    const cards = [
      {
        label: "Sudah diterima",
        value: formatCurrency(totalAcceptedAmount),
        helper: `${acceptedPayrolls.length} payroll cair`,
        icon: WalletCards,
        tone: "bg-[#cdedae] text-[#2b4316]",
      },
      {
        label: "Menunggu admin",
        value: formatCurrency(totalPendingAmount),
        helper: `${pendingPayrolls.length} payroll pending`,
        icon: Hourglass,
        tone: "bg-[#ffe1c7] text-[#774e15]",
      },
      {
        label: roleCopy.weightLabel,
        value: `${formatCurrency(totalWeight)} kg`,
        helper: `${payrolls.length} catatan payroll`,
        icon: Scale,
        tone: "bg-[#d7e3ff] text-[#24527a]",
      },
      {
        label: "Ditolak",
        value: String(rejectedPayrolls.length),
        helper: "Cek alasan pada riwayat",
        icon: History,
        tone: "bg-[#ffdad6] text-[#93000a]",
      },
    ];

    return (
      <section className="space-y-4">
        <div>
          <p className="mono-label text-[#74796d]">Payroll Pribadi</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#1a1c18]">{roleCopy.title}</h2>
          <p className="mt-1 text-sm text-[#74796d]">{roleCopy.description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, helper, icon: Icon, tone }) => (
            <article key={label} className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-4 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mono-label text-[#74796d]">{label}</p>
                  <p className="mt-3 text-2xl font-bold text-[#1a1c18]">{value}</p>
                  <p className="mt-1 text-sm text-[#74796d]">{helper}</p>
                </div>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="size-5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <main className="space-y-6">
        {feedback ? <p className="rounded-lg bg-[#cdedae] px-4 py-3 text-sm font-medium text-[#2b4316]">{feedback}</p> : null}
        {error ? <p className="rounded-lg bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm font-medium text-[#93000a]">{error}</p> : null}

        {isAdmin ? renderAdminWageConfiguration() : renderPersonalSummary()}

        <section className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(116,121,109,0.16)] p-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-[#1a1c18]">
                  {isAdmin ? "Payroll Approval Queue" : "Riwayat Transaksi Upah"}
                </h2>
                <Badge variant="muted" className="bg-[rgba(186,26,26,0.08)] text-[#93000a]">
                  {pendingPayrolls.length} pending
                </Badge>
              </div>
              <p className="mt-1 text-sm text-[#74796d]">
                {isAdmin
                  ? "Tinjau payroll, status pembayaran, dan perhitungan bersih."
                  : "Filter riwayat berdasarkan tanggal dan status payroll."}
              </p>
            </div>
            {session.role === "ADMIN" ? (
              <Button type="button" size="sm" disabled={pendingPayrolls.length === 0} onClick={() => void handleApproveAll()}>
                <Check className="size-4" />
                Approve All
              </Button>
            ) : null}
          </div>

          <form className="grid gap-3 border-b border-[rgba(116,121,109,0.16)] bg-[#f4f4ed]/55 p-5 lg:grid-cols-[minmax(0,1fr)_11rem_12rem_auto]" onSubmit={handleFilter}>
            {isAdmin ? (
              <Input
                value={beneficiaryReference}
                onChange={(event) => setBeneficiaryReference(event.target.value)}
                placeholder="Beneficiary reference"
              />
            ) : (
              <div className="flex min-h-12 items-center rounded-lg border border-[#c4c8ba] bg-white px-4 text-sm font-semibold text-[#44483e]">
                Payroll untuk {session.username}
              </div>
            )}
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
            <Button type="submit" disabled={isLoading} variant="secondary">
              <Filter className="size-4" />
              {isLoading ? "Memuat..." : "Filter"}
            </Button>
          </form>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className={cnPayrollGrid(isAdmin, "border-b border-[rgba(116,121,109,0.16)] px-5 py-3 text-xs font-bold uppercase text-[#74796d]")}>
                <span>{isAdmin ? "Personel" : roleCopy?.sourceLabel}</span>
                <span>Perhitungan</span>
                <span className="text-right">Net Amount</span>
                {isAdmin ? <span className="text-right">Actions</span> : null}
              </div>

              {payrolls.map((payroll) => (
                <article key={payroll.id} className="border-b border-[rgba(116,121,109,0.12)] px-5 py-4 last:border-b-0">
                  <div className={cnPayrollGrid(isAdmin, "items-center gap-4")}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#cdedae] text-sm font-bold text-[#2b4316]">
                        {isAdmin ? getInitials(payroll.beneficiaryReference) : <Calculator className="size-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#1a1c18]">
                          {isAdmin ? payroll.beneficiaryReference : `Payroll #${payroll.id}`}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant={payroll.status === "PENDING" ? "muted" : payroll.status === "ACCEPTED" ? "default" : "outline"} className="px-2 py-0.5 text-[0.65rem]">
                            {payrollStatusLabels[payroll.status]}
                          </Badge>
                          <span className="text-[0.7rem] font-semibold text-[#74796d]">
                            {isAdmin ? payroll.recipientRole : formatDateTime(payroll.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1a1c18]">
                        <Scale className="size-4 text-[#74796d]" />
                        {formatCurrency(payroll.weightKg)} kg
                        <span className="text-[#74796d]">x</span>
                        Rp {formatCurrency(payroll.wageRatePerKg)}
                        <span className="text-[#74796d]">x</span>
                        90%
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-[#74796d]">{payroll.description}</p>
                      {payroll.rejectionReason ? (
                        <p className="mt-2 text-xs font-medium text-[#93000a]">{payroll.rejectionReason}</p>
                      ) : null}
                    </div>

                    <p className="text-right text-lg font-bold text-[#1a1c18]">
                      {formatCurrency(payroll.amount)}
                    </p>

                    {isAdmin ? (
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="icon" variant="secondary" disabled={payroll.status !== "PENDING"} onClick={() => void handleReject(payroll)} aria-label="Reject payroll">
                          <X className="size-4" />
                        </Button>
                        <Button type="button" size="icon" disabled={payroll.status !== "PENDING"} onClick={() => void handleAccept(payroll)} aria-label="Accept payroll">
                          <Check className="size-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {isAdmin && payroll.status === "PENDING" ? (
                    <Textarea
                      value={rejectReasons[payroll.id] ?? ""}
                      onChange={(event) => setRejectReasons((current) => ({ ...current, [payroll.id]: event.target.value }))}
                      placeholder="Alasan penolakan"
                      className="mt-3 min-h-14 rounded-lg bg-[#f4f4ed]"
                    />
                  ) : null}
                </article>
              ))}

              {payrolls.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#74796d]">Belum ada payroll untuk filter ini.</div>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-lg border border-[#0f3d2e] bg-[#08291d] p-5 text-white shadow-[0_18px_44px_rgba(8,41,29,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">{isAdmin ? "Payment Hub" : roleCopy?.walletLabel}</p>
            <WalletCards className="size-5 text-[#cdedae]" />
          </div>
          <div className="mt-6">
            <p className="mono-label text-[#a8c7b4]">{isAdmin ? "System Wallet Balance" : "Saldo Wallet"}</p>
            <p className="mt-2 text-3xl font-bold leading-tight">
              {formatCurrency(wallet?.balance ?? 0)}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#a8c7b4]">SawitDollar</p>
          </div>
          <div className="mt-5 rounded-lg bg-white/10 p-4">
            <p className="mono-label text-[#a8c7b4]">Local Equivalent</p>
            <p className="mt-2 text-lg font-bold">{formatRupiah(wallet?.rupiahEquivalent ?? 0)}</p>
          </div>
          {isAdmin ? (
            <form className="mt-5 space-y-3" onSubmit={handleTopUp}>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={topUpAmount}
                onChange={(event) => setTopUpAmount(event.target.value)}
                placeholder="Jumlah top up"
                className="border-white/20 bg-white text-[#1a1c18]"
                required
              />
              <Button
                type="submit"
                className="w-full border-white bg-white text-[#0f3d2e] hover:bg-[#cdedae]"
                disabled={isCreatingTopUp}
              >
                {isCreatingTopUp ? <LoaderCircle className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                Pay with Xendit
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                disabled={isCreatingTopUp || !topUpAmount}
                onClick={() => void handleManualTopUp()}
              >
                <WalletCards className="size-4" />
                Manual Top Up
              </Button>
              {latestXenditTopUp ? (
                <div className="rounded-lg bg-white/10 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-[#a8c7b4]">Xendit Invoice</span>
                    <Badge variant="default" className="bg-[#cdedae] text-[#2b4316]">
                      {xenditTopUpStatusLabels[latestXenditTopUp.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 font-bold">{formatRupiah(latestXenditTopUp.rupiahAmount)}</p>
                  {latestXenditTopUp.invoiceUrl ? (
                    <a
                      href={latestXenditTopUp.invoiceUrl}
                      className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#cdedae] underline-offset-4 hover:underline"
                    >
                      Continue payment <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </form>
          ) : null}
        </section>

        <section className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <p className="mono-label text-[#74796d]">{isAdmin ? "Recent Gateways" : "Transaksi Wallet"}</p>
            <Banknote className="size-4 text-[#74796d]" />
          </div>
          <div className="mt-4 space-y-3">
            {transactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(116,121,109,0.18)] bg-[#f4f4ed] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#1a1c18]">{transaction.description}</p>
                  <p className="mt-1 text-xs text-[#74796d]">{formatDateTime(transaction.createdAt)}</p>
                </div>
                <p className={transaction.amount < 0 ? "text-sm font-bold text-[#93000a]" : "text-sm font-bold text-[#0f3d2e]"}>
                  {transaction.amount > 0 ? "+" : ""}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
            {transactions.length === 0 ? (
              <p className="rounded-lg bg-[#f4f4ed] p-3 text-sm text-[#74796d]">Belum ada transaksi wallet.</p>
            ) : null}
          </div>
        </section>
      </aside>
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

function cnPayrollGrid(isAdmin: boolean, className: string) {
  return `grid ${isAdmin ? "grid-cols-[1.3fr_1.45fr_0.8fr_0.75fr]" : "grid-cols-[1.1fr_1.45fr_0.8fr]"} gap-4 ${className}`;
}

function getInitials(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PR";
}
