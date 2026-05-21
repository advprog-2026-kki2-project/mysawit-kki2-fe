"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, RefreshCcw, Save, X } from "lucide-react";

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
  getPayrolls,
  getWageConfiguration,
  rejectPayroll,
  saveWageConfiguration,
} from "@/modules/payroll/data/payroll-api";
import {
  payrollStatusLabels,
  payrollStatusOptions,
  type Payroll,
  type PayrollStatus,
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
  const [laborerWage, setLaborerWage] = useState("");
  const [driverWage, setDriverWage] = useState("");
  const [foremanWage, setForemanWage] = useState("");
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
      setPayrolls(await getPayrolls({ beneficiaryReference, status }));
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

  useEffect(() => {
    if (session.role === "ADMIN") {
      void loadWages();
    }
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

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPayrolls();
  }

  async function handleAccept(payroll: Payroll) {
    await acceptPayroll(payroll.id);
    setFeedback(`Payroll ${payroll.id} disetujui.`);
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

        <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_12rem_auto]" onSubmit={handleFilter}>
          <Input
            value={beneficiaryReference}
            onChange={(event) => setBeneficiaryReference(event.target.value)}
            placeholder="Beneficiary reference"
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
