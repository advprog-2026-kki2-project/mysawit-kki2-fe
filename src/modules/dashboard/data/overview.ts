import {
  CircleDollarSign,
  ClipboardCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type OverviewAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const overviewActions = [
  {
    label: "Validasi panen",
    href: "/harvest",
    icon: ClipboardCheck,
  },
  {
    label: "Atur pickup",
    href: "/transport",
    icon: Truck,
  },
  {
    label: "Cek payroll",
    href: "/payroll",
    icon: CircleDollarSign,
  },
] as const satisfies readonly OverviewAction[];
