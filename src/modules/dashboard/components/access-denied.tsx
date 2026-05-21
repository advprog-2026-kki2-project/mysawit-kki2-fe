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
    <section className="max-w-2xl rounded-[1.5rem] border border-[rgba(212,86,86,0.25)] bg-white p-6 shadow-[0_2px_4px_rgba(13,13,13,0.03)]">
      <div className="inline-flex size-11 items-center justify-center rounded-full bg-[rgba(212,86,86,0.08)] text-[#a54141]">
        <ShieldAlert className="size-5" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-[#0d0d0d]">
        Akses tidak tersedia.
      </h2>
      <p className="mt-3 text-sm leading-7 text-[#666666]">
        Halaman ini hanya dapat dibuka oleh {roleText ?? "role tertentu"}.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Kembali ke dashboard</Link>
      </Button>
    </section>
  );
}
