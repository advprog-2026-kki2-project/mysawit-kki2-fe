import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const componentSections = [
  {
    title: "Buttons",
    label: "Call to action",
    description:
      "Use clear actions for primary, secondary, and optional steps.",
    content: (
      <div className="flex flex-wrap gap-4">
        <Button>Get Started</Button>
        <Button variant="secondary">Book a demo</Button>
        <Button variant="ghost">View docs</Button>
      </div>
    ),
  },
  {
    title: "Badges",
    label: "Utility labels",
    description:
      "Use badges for short status or category labels.",
    content: (
      <div className="flex flex-wrap gap-4">
        <Badge>Brand badge</Badge>
        <Badge variant="outline">Outline badge</Badge>
        <Badge variant="muted">Muted badge</Badge>
      </div>
    ),
  },
  {
    title: "Inputs",
    label: "Forms",
    description:
      "Use short labels and placeholders that help users finish the form.",
    content: (
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="you@company.com" />
        <Input placeholder="Project name" />
        <div className="md:col-span-2">
          <Textarea placeholder="Add details" />
        </div>
      </div>
    ),
  },
  {
    title: "Separators",
    label: "Rhythm",
    description:
      "Use separators to group related content.",
    content: (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 text-sm text-[#333333]">
          <span>Hero section</span>
          <span className="mono-label text-[0.65rem] text-[#888888]">
            Display + CTA
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4 text-sm text-[#333333]">
          <span>Feature section</span>
          <span className="mono-label text-[0.65rem] text-[#888888]">
            Cards + grid
          </span>
        </div>
      </div>
    ),
  },
];

export default function DesignSystemPage() {
  return (
    <div className="page-shell bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
        <div className="flex flex-col gap-8">
          <Link
            href="/"
            className="mono-label inline-flex w-fit items-center gap-2 text-[#888888] transition-colors hover:text-[#18E299]"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-5">
              <Badge className="w-fit">Design system</Badge>
              <h1 className="display-title max-w-[10ch] text-[3rem] sm:text-[4.5rem] lg:text-[5.5rem]">
                Review shared components.
              </h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#666666]">
              Use this page to check shared UI patterns and form copy.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6">
          {componentSections.map((section) => (
            <section
              key={section.title}
              className="surface-panel rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10"
            >
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
                <div className="space-y-4">
                  <p className="mono-label text-[#888888]">{section.label}</p>
                  <h2 className="display-title text-[2.2rem] sm:text-[2.75rem]">
                    {section.title}
                  </h2>
                  <p className="max-w-md text-sm leading-7 text-[#666666]">
                    {section.description}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-white p-5 sm:p-6">
                  {section.content}
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="surface-panel mt-8 rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mono-label text-[#888888]">Next step</p>
              <h2 className="display-title mt-4 max-w-[10ch] text-[2.4rem] sm:text-[3rem]">
                Return to the main pages.
              </h2>
            </div>
            <Button asChild>
              <Link href="/">Return to home</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
