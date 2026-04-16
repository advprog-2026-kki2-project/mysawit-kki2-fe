import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, UserRound } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: ClipboardCheck,
    title: "Isi data akun",
    body: "Lengkapi form sesuai data yang akan Anda gunakan.",
  },
  {
    icon: UserRound,
    title: "Periksa kembali data",
    body: "Pastikan email, username, dan role sudah sesuai.",
  },
  {
    icon: BadgeCheck,
    title: "Lanjut ke langkah berikutnya",
    body: "Setelah selesai, masuk ke akun Anda untuk mulai bekerja.",
  },
];

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  alternatePrompt: string;
  children: ReactNode;
};

export function AuthShell({
  badge,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternatePrompt,
  children,
}: AuthShellProps) {
  return (
    <div className="page-shell bg-background text-foreground">
      <SiteHeader
        navLinks={[
          { href: "/", label: "Beranda" },
          { href: "/design-system", label: "Design System" },
        ]}
        secondaryAction={{ href: "/", label: "Kembali", variant: "secondary" }}
        primaryAction={{ href: alternateHref, label: alternateLabel }}
      />

      <main className="hero-atmosphere">
        <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-18">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
            <div className="space-y-6">
              <Badge>{badge}</Badge>
              <div className="max-w-2xl">
                <h1 className="display-title text-[3rem] sm:text-[4.2rem] lg:text-[5rem]">
                  {title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-[#666666] sm:text-lg">
                  {description}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {highlights.map(({ icon: Icon, title: itemTitle, body }) => (
                  <article
                    key={itemTitle}
                    className="surface-card rounded-[1.6rem] p-5"
                  >
                    <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#d4fae8] text-[#0fa76e]">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#0d0d0d]">
                      {itemTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-[#666666]">{body}</p>
                  </article>
                ))}
              </div>

              <div className="surface-panel flex flex-col gap-4 rounded-[1.8rem] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mono-label text-[#888888]">Akses Akun</p>
                  <p className="mt-2 text-sm leading-7 text-[#666666]">
                    {alternatePrompt}
                  </p>
                </div>
                <Button asChild variant="ghost">
                  <Link href={alternateHref}>
                    {alternateLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="surface-panel rounded-[2rem] p-5 sm:p-6">{children}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
