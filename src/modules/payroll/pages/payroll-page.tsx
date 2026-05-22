"use client";

import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { PayrollManager } from "@/modules/payroll/components/payroll-manager";

const allowedRoles = [
  "LABORER",
  "FOREMAN",
  "DRIVER",
  "ADMIN",
] as const satisfies readonly Role[];

export function PayrollPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Payroll"
      description="Pantau payroll, status pembayaran, dan konfigurasi upah per kilogram."
    >
      {(session) => <PayrollManager session={session} />}
    </ProtectedRoute>
  );
}
