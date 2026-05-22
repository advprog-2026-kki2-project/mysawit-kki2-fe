"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
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
import type { AuthResponse } from "@/modules/auth/data/types";
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
    <Sidebar collapsible="icon" className="md:p-5">
      <SidebarHeader className="px-4 py-5">
        <Link
          href="/dashboard"
          className="flex min-h-12 items-center gap-3 rounded-lg px-1"
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFFEF1] text-white shadow-[0_8px_20px_rgba(43,67,22,0.16)]">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="aspect-square object-contain"
            />
          </span>
          <span className="min-w-0 truncate font-[var(--font-syne)] text-xl font-bold text-[#324a1f]">
            MySawit
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-1 text-[0.7rem] font-semibold uppercase text-[#74796d]">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {navigation.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                    className="h-11 rounded-lg text-[0.95rem] text-[#1a1c18] hover:bg-[#efeee7] hover:text-[#2b4316] data-[active=true]:!border-[#2b4316]/20 data-[active=true]:!bg-[#cdedae] data-[active=true]:!text-[#2b4316] [&>svg]:!text-[#2b4316]"
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

      <SidebarSeparator className="bg-transparent" />

      <div className="px-5 pb-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a] group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            {isLoggingOut ? "Logout..." : "Logout"}
          </span>
        </Button>
      </div>
    </Sidebar>
  );
}
