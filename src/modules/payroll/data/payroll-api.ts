import { requestJson } from "@/lib/api-client";
import type {
  Payroll,
  PayrollStatus,
  WageConfiguration,
  WageConfigurationPayload,
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
}) {
  const params = new URLSearchParams();
  if (filters.beneficiaryReference?.trim()) {
    params.set("beneficiaryReference", filters.beneficiaryReference.trim());
  }
  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  const query = params.toString();

  return requestJson<Payroll[]>(`/api/payroll${query ? `?${query}` : ""}`, {
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
