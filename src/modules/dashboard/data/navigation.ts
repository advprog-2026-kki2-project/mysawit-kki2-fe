import {
  ClipboardList,
  LayoutDashboard,
  Truck,
  Users,
  WalletCards,
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
    description: "Kirim dan validasi panen harian.",
    icon: ClipboardList,
    roles: ["LABORER", "FOREMAN"],
  },
  {
    href: "/plantations",
    label: "Plantations",
    description: "Kelola data plantation.",
    icon: Sprout,
    roles: ["ADMIN"],
  },
  {
    href: "/users",
    label: "Pengguna",
    description: "Kelola akun dan assignment buruh.",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    href: "/transport",
    label: "Transport",
    description: "Atur pickup dan verifikasi pengiriman.",
    icon: Truck,
    roles: ["FOREMAN", "DRIVER", "ADMIN"],
  },
  {
    href: "/payroll",
    label: "Payroll",
    description: "Kelola upah dan status payroll.",
    icon: WalletCards,
    roles: dashboardRoles,
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
