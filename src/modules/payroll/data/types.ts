import type { Role } from "@/modules/auth/data/types";

export const payrollStatusOptions = ["PENDING", "ACCEPTED", "REJECTED"] as const;

export type PayrollStatus = (typeof payrollStatusOptions)[number];

export const payrollStatusLabels: Record<PayrollStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export type Payroll = {
  id: string;
  beneficiaryReference: string;
  recipientRole: Role;
  sourceType: "HARVEST_APPROVAL" | "DELIVERY_COMPLETION" | "DELIVERY_APPROVAL";
  sourceReferenceId: string;
  weightKg: number;
  wageRatePerKg: number;
  amount: number;
  status: PayrollStatus;
  description: string;
  rejectionReason: string | null;
  createdAt: string;
};

export type Wallet = {
  accountReference: string;
  accountRole: Role;
  balance: number;
  rupiahEquivalent: number;
  updatedAt: string;
};

export type WalletTransactionType =
  | "TOP_UP"
  | "PAYROLL_CREDIT"
  | "PAYROLL_DEBIT";

export type WalletTransaction = {
  id: string;
  accountReference: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  referenceId: string;
  createdAt: string;
};

export type WageConfiguration = {
  id: number;
  laborerWagePerKg: number;
  driverWagePerKg: number;
  foremanWagePerKg: number;
  updatedAt: string;
};

export type WageConfigurationPayload = {
  laborerWagePerKg: number;
  driverWagePerKg: number;
  foremanWagePerKg: number;
};
