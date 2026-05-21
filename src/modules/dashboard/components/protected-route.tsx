"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type { AuthResponse, Role } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { AccessDenied } from "@/modules/dashboard/components/access-denied";
import { DashboardShell } from "@/modules/dashboard/components/dashboard-shell";
import { canAccessRoute } from "@/modules/dashboard/data/navigation";

type ProtectedRouteProps = {
  allowedRoles?: readonly Role[];
  title: string;
  description?: string;
  children: ReactNode | ((session: AuthResponse) => ReactNode);
};

function renderChildren(
  children: ProtectedRouteProps["children"],
  session: AuthResponse,
) {
  if (typeof children === "function") {
    return children(session);
  }

  return children;
}

export function ProtectedRoute({
  allowedRoles,
  title,
  description,
  children,
}: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, error } = useAuthSession();

  useEffect(() => {
    if (!isLoading && !session && !error) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [error, isLoading, pathname, router, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f4f4ed] px-6">
        <div className="w-full max-w-sm rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="h-4 w-28 animate-pulse rounded-lg bg-[#cdedae]" />
          <div className="mt-5 h-7 w-44 animate-pulse rounded-lg bg-[#e3e3dc]" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-lg bg-[#e3e3dc]" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-lg bg-[#e3e3dc]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f4f4ed] px-6">
        <div className="max-w-md rounded-lg border border-[rgba(186,26,26,0.25)] bg-white p-6 text-sm text-[#93000a]">
          {error}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f4f4ed] px-6">
        <div className="w-full max-w-sm rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="h-4 w-28 animate-pulse rounded-lg bg-[#cdedae]" />
          <div className="mt-5 h-7 w-44 animate-pulse rounded-lg bg-[#e3e3dc]" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-lg bg-[#e3e3dc]" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-lg bg-[#e3e3dc]" />
        </div>
      </div>
    );
  }

  if (!canAccessRoute(session.role, allowedRoles)) {
    return (
      <DashboardShell
        session={session}
        title="Akses Ditolak"
        description="Role akun Anda tidak memiliki akses ke halaman ini."
      >
        <AccessDenied allowedRoles={allowedRoles} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell session={session} title={title} description={description}>
      {renderChildren(children, session)}
    </DashboardShell>
  );
}
