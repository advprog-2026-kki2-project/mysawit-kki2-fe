import { requestJson } from "@/lib/api-client";
import type {
  Payroll,
  PayrollStatus,
  Wallet,
  WalletTransaction,
  WageConfiguration,
  WageConfigurationPayload,
  XenditWalletTopUp,
} from "@/modules/payroll/data/types";

export function getWageConfiguration() {
  return requestJson<WageConfiguration>("/api/payroll/wages", {
    method: "GET",
  });
}

export function saveWageConfiguration(payload: WageConfigurationPayload) {
  return requestJson<WageConfiguration>("/api/payroll/wages", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getPayrolls(filters: {
  beneficiaryReference?: string;
  status?: PayrollStatus | "ALL";
  date?: string;
}) {
  const params = new URLSearchParams();
  if (filters.beneficiaryReference?.trim()) {
    params.set("beneficiaryReference", filters.beneficiaryReference.trim());
  }
  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.date) {
    params.set("date", filters.date);
  }
  const query = params.toString();

  return requestJson<Payroll[]>(`/api/payroll${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getWallet() {
  return requestJson<Wallet>("/api/payment/wallet", {
    method: "GET",
  });
}

export function getWalletTransactions() {
  return requestJson<WalletTransaction[]>("/api/payment/wallet/transactions", {
    method: "GET",
  });
}

export function topUpWallet(amount: number) {
  return requestJson<Wallet>("/api/payment/wallet/top-up", {
    method: "POST",
    body: JSON.stringify({
      amount,
      topUpReference: `MANUAL-${Date.now()}`,
    }),
  });
}

export function createXenditTopUp(amount: number) {
  return requestJson<XenditWalletTopUp>("/api/payment/wallet/top-up/xendit", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export function getXenditTopUps() {
  return requestJson<XenditWalletTopUp[]>("/api/payment/wallet/top-up/xendit", {
    method: "GET",
  });
}

export function getXenditTopUp(paymentId: string) {
  return requestJson<XenditWalletTopUp>(`/api/payment/wallet/top-up/xendit/${paymentId}`, {
    method: "GET",
  });
}

export function acceptPayroll(payrollId: string) {
  return requestJson<Payroll>(`/api/payroll/${payrollId}/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function rejectPayroll(payrollId: string, rejectionReason: string) {
  return requestJson<Payroll>(`/api/payroll/${payrollId}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectionReason }),
  });
}
