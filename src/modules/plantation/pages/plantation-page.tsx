import { Badge } from "@/components/ui/badge";
import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { PlantationManager } from "@/modules/plantation/components/plantation-manager";

const allowedRoles = ["ADMIN"] as const satisfies readonly Role[];

export function PlantationPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Plantations"
      description="Kelola data plantation untuk kebutuhan operasional admin."
    >
      <section className="space-y-6">
        <div className="max-w-2xl">
          <Badge>Plantation</Badge>
          <h2 className="mt-5 text-3xl font-semibold text-[#0d0d0d] sm:text-4xl">
            Kelola data plantation.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#666666]">
            Gunakan data yang sudah tersedia dari backend.
          </p>
        </div>

        <PlantationManager />
      </section>
    </ProtectedRoute>
  );
}
