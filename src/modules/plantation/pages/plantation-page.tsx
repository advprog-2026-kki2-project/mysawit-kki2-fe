import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { PlantationManager } from "@/modules/plantation/components/plantation-manager";

const allowedRoles = ["ADMIN"] as const satisfies readonly Role[];

export function PlantationPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Manajemen Kebun Sawit"
      description="Kelola kebun, koordinat persegi, mandor pengawas, dan supir truk."
      aside={null}
    >
      <PlantationManager />
    </ProtectedRoute>
  );
}
