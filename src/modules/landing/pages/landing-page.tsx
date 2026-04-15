import Link from "next/link";
import { ArrowRight, Check, Play } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  featureCards,
  landingStats,
  roleCards,
  workflowSteps,
} from "../data/content";

export function LandingPage() {
  return (
    <div className="page-shell bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="hero-atmosphere border-b border-[rgba(13,13,13,0.05)]">
          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <Badge>Platform Manajemen Kebun Sawit</Badge>
                <h1 className="display-title mt-7 text-[3.25rem] sm:text-[4.5rem] lg:text-[5.75rem]">
                  Operasional sawit yang lebih ringkas dan terlihat jelas.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#666666] sm:text-lg">
                  MySawit menyatukan panen, pengangkutan, dan pemantauan dalam
                  satu platform yang ringan dan mudah dipahami.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="#overview">
                    <Button size="lg">Lihat ringkasan<ArrowRight /></Button>
                      
                      
                    </Link>
                  <Link href="#roles">
                  <Button variant="secondary" size="lg">
                      <Play className="size-4" />
                      Jelajahi peran
                  </Button>
                  </Link>
                </div>

                <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                  {landingStats.map((item) => (
                    <div
                      key={item.label}
                      className="surface-card rounded-[1.5rem] px-4 py-5 text-center"
                    >
                      <p className="text-2xl font-semibold tracking-[-0.04em] text-[#0d0d0d] sm:text-3xl">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm text-[#666666]">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-panel rounded-[2rem] p-4 sm:p-5">
                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-[#fcfffe] p-6 sm:p-7">
                    <p className="mono-label text-[#888888]">Workflow</p>
                    <div className="mt-5 grid gap-3">
                      {workflowSteps.map((step, index) => (
                        <div
                          key={step}
                          className="flex items-center justify-between rounded-[1.25rem] border border-[rgba(13,13,13,0.05)] bg-white px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#d4fae8] text-sm font-medium text-[#0fa76e]">
                              0{index + 1}
                            </span>
                            <span className="text-sm font-medium text-[#333333]">
                              {step}
                            </span>
                          </div>
                          <Check className="size-4 text-[#18E299]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-white p-6 sm:p-7">
                    <p className="mono-label text-[#888888]">Highlight</p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
                      Satu dashboard untuk aktivitas lapangan hingga approval.
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-7 text-[#666666]">
                      Dibuat untuk membantu tim melihat status operasional tanpa
                      tampilan yang padat atau membingungkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="overview"
          className="border-b border-[rgba(13,13,13,0.05)]"
        >
          <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
            <div className="grid gap-6 lg:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="surface-card rounded-[1.75rem] p-6 sm:p-7"
                >
                  <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#d4fae8] text-[#0fa76e]">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#0d0d0d]">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-[#666666]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="border-b border-[rgba(13,13,13,0.05)]">
          <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-4 sm:max-w-xl">
              <p className="mono-label text-[#888888]">Peran Pengguna</p>
              <h2 className="display-title text-[2.5rem] sm:text-[3.4rem]">
                Empat peran, satu alur kerja.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {roleCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="surface-card rounded-[1.5rem] p-6"
                >
                  <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[rgba(13,13,13,0.05)] bg-white text-[#0d0d0d]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[#0d0d0d]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#666666]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="surface-panel rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="mono-label text-[#888888]">Simple Landing Page</p>
                <h2 className="display-title mt-4 text-[2.3rem] sm:text-[3rem]">
                  Clean, ringan, dan langsung ke inti produk.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                
                <Link href="#roles"><Button >Mulai lihat flow
                  
                </Button></Link>
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
