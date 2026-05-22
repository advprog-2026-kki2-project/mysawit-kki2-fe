"use client";

import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { TransportManager } from "@/modules/transport/components/transport-manager";

const allowedRoles = ["FOREMAN", "DRIVER", "ADMIN"] as const satisfies readonly Role[];

export function TransportPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Transport"
      description="Atur pickup, status pengiriman, dan verifikasi pengiriman sawit."
    >
      {(session) => <TransportManager session={session} />}
    </ProtectedRoute>
  );
}
