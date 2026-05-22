import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { roleLabels, type Role } from "@/modules/auth/data/types";

type AccessDeniedProps = {
  allowedRoles?: readonly Role[];
};

export function AccessDenied({ allowedRoles }: AccessDeniedProps) {
  const roleText = allowedRoles?.map((role) => roleLabels[role]).join(", ");

  return (
    <section className="max-w-2xl rounded-lg border border-[rgba(186,26,26,0.25)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="inline-flex size-11 items-center justify-center rounded-lg bg-[rgba(186,26,26,0.08)] text-[#93000a]">
        <ShieldAlert className="size-5" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-[#1a1c18]">
        Akses tidak tersedia.
      </h2>
      <p className="mt-3 text-sm leading-7 text-[#44483e]">
        Halaman ini hanya dapat dibuka oleh {roleText ?? "role tertentu"}.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Kembali ke dashboard</Link>
      </Button>
    </section>
  );
}
