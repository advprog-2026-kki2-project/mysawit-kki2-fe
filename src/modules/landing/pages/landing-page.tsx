"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Play, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";

import {
  featureCards,
  landingStats,
  previewTasks,
  roleCards,
  trustPoints,
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
          <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-12 lg:px-8 lg:pb-16 lg:pt-16">
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="max-w-2xl">
                <Badge className="gap-2 bg-white/80 shadow-[0_10px_30px_rgba(43,67,22,0.08)]">
                  <Sparkles className="size-3.5" />
                  Mysawit Field Operations
                </Badge>
                <h1 className="display-title mt-7 text-5xl text-[#15210f] max-md:text-4xl lg:text-6xl">
                  Kelola panen sawit dari lapangan sampai approval.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-[#44483e] sm:text-lg">
                  {isLoading
                    ? "Memeriksa sesi akun Anda."
                    : session
                      ? `Anda masuk sebagai ${session.username} (${sessionRoleLabel}).`
                      : "Satu ruang kerja untuk pekerja, mandor, supir, dan admin pusat agar data panen tidak tercecer."}
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

                <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                  {landingStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-white/70 bg-white/75 px-4 py-5 text-center shadow-[0_16px_40px_rgba(43,67,22,0.09)] backdrop-blur"
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

              <div className="relative">
                <div className="absolute -right-4 top-8 hidden h-32 w-32 rounded-full bg-[#f1b15f]/35 blur-3xl lg:block" />
                <div className="surface-panel relative overflow-hidden rounded-lg p-4 sm:p-5">
                  <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(63,105,1,0.16),rgba(15,96,112,0.16),rgba(241,177,95,0.18))]" />
                  <div className="relative rounded-lg border border-white/70 bg-white p-5 shadow-[0_18px_50px_rgba(26,28,24,0.08)] sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-14 overflow-hidden rounded-lg bg-[#f5f6ee]">
                          <Image
                            src="/logo-round.png"
                            alt="Mysawit"
                            fill
                            className="object-contain p-1.5"
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <p className="mono-label text-[#74796d]">
                            Hari ini
                          </p>
                          <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1a1c18]">
                            Operasi panen
                          </h2>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#d9f3c4] px-3 py-1 text-xs font-semibold text-[#2b4316]">
                        Live
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {["Panen", "Validasi", "Angkut"].map((label, index) => (
                        <div
                          key={label}
                          className="rounded-lg border border-[rgba(116,121,109,0.2)] bg-[#fafaf2] p-3"
                        >
                          <div className="h-2 rounded-full bg-[#e1e4d8]">
                            <div
                              className="h-2 rounded-full bg-[linear-gradient(90deg,#3f6901,#0f6070)]"
                              style={{ width: `${92 - index * 17}%` }}
                            />
                          </div>
                          <p className="mt-3 text-xs font-semibold text-[#44483e]">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3">
                      {previewTasks.map((task) => (
                        <div
                          key={task.title}
                          className="flex items-center justify-between gap-4 rounded-lg border border-[rgba(116,121,109,0.2)] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(26,28,24,0.05)]"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#1a1c18]">
                              {task.title}
                            </p>
                            <p className="mt-1 text-xs text-[#74796d]">
                              {task.meta}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#eef6f7] px-3 py-1 text-xs font-semibold text-[#0f6070]">
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-4 grid gap-4 rounded-lg border border-[rgba(116,121,109,0.18)] bg-[#25371d] p-5 text-white sm:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <p className="mono-label text-[#d9f3c4]">Workflow</p>
                      <p className="mt-3 text-sm leading-6 text-white/78">
                        Semua role bergerak dalam urutan yang sama, jadi status
                        pekerjaan lebih mudah dibaca.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      {workflowSteps.map((step, index) => (
                        <div
                          key={step}
                          className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2"
                        >
                          <span className="inline-flex size-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#2b4316]">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
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
            <div className="mb-10 max-w-2xl">
              <p className="mono-label text-[#74796d]">Overview</p>
              <h2 className="display-title mt-4 text-3xl text-[#1a1c18] sm:text-4xl">
                Dibuat untuk ritme kerja kebun.
              </h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="group surface-card rounded-lg p-6 transition-transform duration-200 hover:-translate-y-1 sm:p-7"
                >
                  <div className="inline-flex size-12 items-center justify-center rounded-lg bg-[#cdedae] text-[#3f6901] transition-colors group-hover:bg-[#2b4316] group-hover:text-white">
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
                <article
                  key={title}
                  className="surface-card rounded-lg p-6 transition-colors hover:border-[#3f6901]/45 hover:bg-[#fbfff7]"
                >
                  <div className="inline-flex size-11 items-center justify-center rounded-lg border border-[rgba(116,121,109,0.24)] bg-white text-[#1a1c18]">
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

        <section className="border-b border-[rgba(116,121,109,0.24)] bg-[#f4f6ed]">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
            <div>
              <p className="mono-label text-[#74796d]">Keunggulan</p>
              <h2 className="display-title mt-4 text-3xl text-[#1a1c18] sm:text-4xl">
                Lebih sedikit bolak-balik, lebih banyak pekerjaan selesai.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-lg bg-white p-5 shadow-[0_14px_34px_rgba(43,67,22,0.08)]"
                >
                  <Icon className="size-6 text-[#0f6070]" />
                  <h3 className="mt-4 text-base font-semibold text-[#1a1c18]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#44483e]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="rounded-lg bg-[#25371d] px-6 py-8 text-white shadow-[0_24px_70px_rgba(43,67,22,0.18)] sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="mono-label text-[#d9f3c4]">Akses Akun</p>
                <h2 className="display-title mt-4 text-xl sm:text-2xl">
                  Mulai dari akun yang sesuai dengan pekerjaan Anda.
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
                    <Button className="border-white/20 bg-white text-[#2b4316] hover:bg-[#f4f4ed]">
                      Buat akun
                      <ChevronRight />
                    </Button>
                  </Link>
                )}
                <Button
                  asChild
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
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
