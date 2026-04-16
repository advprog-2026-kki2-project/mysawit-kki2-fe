import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#overview", label: "Overview" },
  { href: "#roles", label: "Roles" },
  { href: "/design-system", label: "Design System" },
];

type HeaderAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
};

type SiteHeaderProps = {
  className?: string;
  navLinks?: typeof links;
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
};

export function SiteHeader({
  className,
  navLinks = links.slice(0, 2),
  primaryAction = { href: "/register", label: "Daftar" },
  secondaryAction = { href: "/login", label: "Masuk", variant: "secondary" },
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[rgba(13,13,13,0.05)] bg-white/85 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(13,13,13,0.08)] bg-white text-sm font-semibold text-[#0d0d0d] shadow-[0_1px_2px_rgba(13,13,13,0.04)]">
            M
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#0d0d0d]">
              Mysawit
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-[#666666] transition-colors hover:text-[#18E299]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {secondaryAction ? (
            <Link href={secondaryAction.href}>
              <Button
                variant={secondaryAction.variant ?? "secondary"}
                size="sm"
              >
                {secondaryAction.label}
              </Button>
            </Link>
          ) : null}

          {primaryAction ? (
            <Link href={primaryAction.href}>
              <Button size="sm">
                {primaryAction.label}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
