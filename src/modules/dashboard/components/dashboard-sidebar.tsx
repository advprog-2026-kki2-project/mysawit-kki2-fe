"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ApiError, logout } from "@/modules/auth/data/auth-api";
import { roleLabels, type AuthResponse } from "@/modules/auth/data/types";
import { getNavigationForRole } from "@/modules/dashboard/data/navigation";

type DashboardSidebarProps = {
  session: AuthResponse;
};

export function DashboardSidebar({ session }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = getNavigationForRole(session.role);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (caughtError) {
      if (!(caughtError instanceof ApiError || caughtError instanceof Error)) {
        return;
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex min-h-12 items-center gap-3 rounded-full px-2"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(13,13,13,0.08)] bg-white text-sm font-semibold text-[#0d0d0d] shadow-[0_1px_2px_rgba(13,13,13,0.04)]">
            M
          </span>
          <span className="min-w-0 truncate text-sm font-semibold text-[#0d0d0d]">
            Mysawit
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="rounded-[1.25rem] border border-[rgba(13,13,13,0.05)] bg-white px-3 py-3 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-sm font-medium text-[#0d0d0d]">
            {session.username}
          </p>
          <p className="mt-1 text-xs text-[#666666]">
            {roleLabels[session.role]}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            {isLoggingOut ? "Logout..." : "Logout"}
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
