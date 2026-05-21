"use client";

import { Badge } from "@/components/ui/badge";
import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { ForemanHarvestReview } from "@/modules/harvest/components/foreman-harvest-review";
import { HarvestHistoryPanel } from "@/modules/harvest/components/harvest-history-panel";
import { HarvestSubmitForm } from "@/modules/harvest/components/harvest-submit-form";

const allowedRoles = ["LABORER", "FOREMAN"] as const satisfies readonly Role[];

export function HarvestPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Panen"
      description="Buruh mengirim panen harian, mandor melakukan validasi hasil panen."
    >
      {(session) => (
        <section className="space-y-6">
          <div className="max-w-2xl">
            <Badge>Harvest</Badge>
            <h2 className="mt-5 text-3xl font-semibold text-[#1a1c18] sm:text-4xl">
              {session.role === "LABORER"
                ? "Kirim dan pantau panen harian."
                : "Review hasil panen buruh."}
            </h2>
          </div>

          {session.role === "LABORER" ? (
            <>
              <HarvestSubmitForm />
              <HarvestHistoryPanel />
            </>
          ) : (
            <ForemanHarvestReview />
          )}
        </section>
      )}
    </ProtectedRoute>
  );
}
