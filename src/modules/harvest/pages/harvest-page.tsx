import { Badge } from "@/components/ui/badge";
import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { HarvestSubmitForm } from "@/modules/harvest/components/harvest-submit-form";

const allowedRoles = ["LABORER"] as const satisfies readonly Role[];

export function HarvestPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Panen"
      description="Kirim data panen harian sesuai akun pekerja."
    >
      <section className="space-y-6">
        <div className="max-w-2xl">
          <Badge>Harvest</Badge>
          <h2 className="mt-5 text-3xl font-semibold text-[#0d0d0d] sm:text-4xl">
            Kirim panen harian.
          </h2>
        </div>

        <HarvestSubmitForm />
      </section>
    </ProtectedRoute>
  );
}
