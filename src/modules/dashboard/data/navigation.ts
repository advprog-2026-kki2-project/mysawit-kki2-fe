import {
  ClipboardList,
  LayoutDashboard,
  Sprout,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/modules/auth/data/types";

export type DashboardNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  roles: readonly Role[];
};

export const dashboardRoles = [
  "LABORER",
  "FOREMAN",
  "DRIVER",
  "ADMIN",
] as const satisfies readonly Role[];

export const dashboardNavigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Ringkasan akses dan pekerjaan Anda.",
    icon: LayoutDashboard,
    roles: dashboardRoles,
  },
  {
    href: "/harvest",
    label: "Panen",
    description: "Kirim panen harian.",
    icon: ClipboardList,
    roles: ["LABORER"],
  },
  {
    href: "/plantations",
    label: "Plantations",
    description: "Kelola data plantation.",
    icon: Sprout,
    roles: ["ADMIN"],
  },
] as const satisfies readonly DashboardNavItem[];

export function getNavigationForRole(role: Role) {
  return dashboardNavigation.filter((item) =>
    item.roles.some((itemRole) => itemRole === role),
  );
}

export function canAccessRoute(role: Role, allowedRoles?: readonly Role[]) {
  return !allowedRoles || allowedRoles.some((itemRole) => itemRole === role);
}
