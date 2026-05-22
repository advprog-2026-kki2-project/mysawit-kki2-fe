"use client";

import Link from "next/link";
import { ArrowRight, Check, Play } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";

import {
  featureCards,
  landingStats,
  roleCards,
  workflowSteps,
} from "../data/content";

export function LandingPage() {
  const { session, isLoading } = useAuthSession();
  const sessionRoleLabel = session ? roleLabels[session.role] : null;
  const roleRoute = session ? "/dashboard" : null;
  const sessionNavLinks = session
    ? [
        { href: "#overview", label: "Overview" },
        roleRoute
          ? {
              href: roleRoute,
              label: "Dashboard",
            }
          : { href: "#roles", label: "Roles" },
      ]
    : undefined;

  return (
    <div className="page-shell bg-background text-foreground">
      <SiteHeader navLinks={sessionNavLinks} />

      <main>
        <section className="hero-atmosphere border-b border-[rgba(116,121,109,0.24)]">
          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <Badge>Mysawit</Badge>
                <h1 className="display-title mt-7 text-5xl max-md:text-4xl">
                  Kelola panen, angkut, dan approval
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#44483e] sm:text-lg">
                  {isLoading
                    ? "Memeriksa sesi akun Anda."
                    : session
                      ? `Anda masuk sebagai ${session.username} (${sessionRoleLabel}).`
                      : "Masuk atau buat akun untuk mulai bekerja."}
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  {session ? (
                    <>
                      <Link href={roleRoute ?? "#roles"}>
                        <Button size="lg">
                          Buka dashboard
                          <ArrowRight />
                        </Button>
                      </Link>
                      <Link href="#overview">
                        <Button variant="secondary" size="lg">
                          <Play className="size-4" />
                          Lihat ringkasan
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/register">
                        <Button size="lg">
                          Buat akun
                          <ArrowRight />
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="secondary" size="lg">
                          <Play className="size-4" />
                          Masuk
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

                <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                  {landingStats.map((item) => (
                    <div
                      key={item.label}
                      className="surface-card rounded-lg px-4 py-5 text-center"
                    >
                      <p className="text-2xl font-semibold tracking-[-0.04em] text-[#1a1c18] sm:text-3xl">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm text-[#44483e]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-panel rounded-lg p-4 sm:p-5">
                <div className="grid gap-4">
                  {session ? (
                    <div className="rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] p-6 sm:p-7">
                      <p className="mono-label text-[#3f6901]">Sesi</p>
                      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
                        Akun Anda sudah terhubung ke backend.
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-7 text-[#44483e]">
                        Lanjutkan menggunakan role{" "}
                        {sessionRoleLabel?.toLowerCase()}.
                      </p>
                    </div>
                  ) : null}
                  <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed] p-6 sm:p-7">
                    <p className="mono-label text-[#74796d]">Workflow</p>
                    <div className="mt-5 grid gap-3">
                      {workflowSteps.map((step, index) => (
                        <div
                          key={step}
                          className="flex items-center justify-between rounded-lg border border-[rgba(116,121,109,0.24)] bg-white px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#cdedae] text-sm font-medium text-[#3f6901]">
                              0{index + 1}
                            </span>
                            <span className="text-sm font-medium text-[#44483e]">
                              {step}
                            </span>
                          </div>
                          <Check className="size-4 text-[#3f6901]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 sm:p-7">
                    <p className="mono-label text-[#74796d]">Status</p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
                      Pantau pekerjaan per tahap.
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-7 text-[#44483e]">
                      Lihat progres tanpa berpindah halaman.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="overview"
          className="border-b border-[rgba(116,121,109,0.24)]"
        >
          <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
            <div className="grid gap-6 lg:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="surface-card rounded-lg p-6 sm:p-7"
                >
                  <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#cdedae] text-[#3f6901]">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#1a1c18]">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-[#44483e]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="roles"
          className="border-b border-[rgba(116,121,109,0.24)]"
        >
          <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-4 sm:max-w-xl">
              <p className="mono-label text-[#74796d]">Role</p>
              <h2 className="display-title  text-3xl sm:text-4xl">
                Gunakan akses sesuai tugas
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {roleCards.map(({ icon: Icon, title, body }) => (
                <article key={title} className="surface-card rounded-lg p-6">
                  <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[rgba(116,121,109,0.24)] bg-white text-[#1a1c18]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[#1a1c18]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#44483e]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="surface-panel rounded-lg px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="mono-label text-[#74796d]">Akses Akun</p>
                <h2 className="display-title mt-4 text-xl sm:text-2xl">
                  Masuk atau buat akun
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {session ? (
                  <Link href={roleRoute ?? "/login"}>
                    <Button variant="secondary">
                      {session.role === "ADMIN"
                        ? "Buka plantations"
                        : session.role === "LABORER"
                          ? "Buka form panen"
                          : "Kelola sesi"}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button>Buat akun</Button>
                  </Link>
                )}
                <Button asChild variant="ghost">
                  <Link href="/design-system">Design system</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
