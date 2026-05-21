import {
  AlertTriangle,
  CircleDollarSign,
  ClipboardCheck,
  Leaf,
  PackageCheck,
  Tractor,
  Truck,
  UserRoundPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type OverviewMetric = {
  label: string;
  value: string;
  helper: string;
  tone: "leaf" | "field" | "sky" | "warning";
  icon: LucideIcon;
};

export type OverviewAction = {
  label: string;
  helper: string;
  href: string;
  icon: LucideIcon;
};

export type OverviewUser = {
  name: string;
  email: string;
  role: string;
  status: "Online" | "Offline";
  initials: string;
};

export type GardenBlock = {
  name: string;
  location: string;
  mandor: string;
  harvest: string;
  tone: "leaf" | "field";
};

export type ActivityItem = {
  title: string;
  helper: string;
  tone: "leaf" | "field" | "danger" | "sky";
  icon: LucideIcon;
};

export const overviewMetrics = [
  {
    label: "Panen hari ini",
    value: "124.402 kg",
    helper: "+12% dari pekan lalu",
    tone: "leaf",
    icon: Leaf,
  },
  {
    label: "Pekerja aktif",
    value: "842",
    helper: "Sedang clock-in",
    tone: "field",
    icon: UsersRound,
  },
  {
    label: "Pengiriman aktif",
    value: "18",
    helper: "4 menuju mill",
    tone: "sky",
    icon: Truck,
  },
  {
    label: "Payroll tertunda",
    value: "Rp12,84 jt",
    helper: "Jatuh tempo 48 jam",
    tone: "warning",
    icon: CircleDollarSign,
  },
] as const satisfies readonly OverviewMetric[];

export const overviewActions = [
  {
    label: "Validasi panen",
    helper: "3 log menunggu review mandor.",
    href: "/harvest",
    icon: ClipboardCheck,
  },
  {
    label: "Atur pickup",
    helper: "4 blok siap dijadwalkan.",
    href: "/transport",
    icon: Truck,
  },
  {
    label: "Cek payroll",
    helper: "2 batch perlu persetujuan.",
    href: "/payroll",
    icon: CircleDollarSign,
  },
] as const satisfies readonly OverviewAction[];

export const overviewUsers = [
  {
    name: "Ahmad Rizky",
    email: "ahmad.r@mysawit.com",
    role: "Manager",
    status: "Online",
    initials: "AR",
  },
  {
    name: "Siti Aminah",
    email: "siti.a@mysawit.com",
    role: "Mandor",
    status: "Offline",
    initials: "SA",
  },
  {
    name: "Budi Santoso",
    email: "budi.s@mysawit.com",
    role: "Pekerja",
    status: "Online",
    initials: "BS",
  },
] as const satisfies readonly OverviewUser[];

export const gardenBlocks = [
  {
    name: "Blok Alpha-04",
    location: "2,41 N, 101,52 E",
    mandor: "Siti Aminah",
    harvest: "38,2 ton",
    tone: "leaf",
  },
  {
    name: "Blok Beta-12",
    location: "2,43 N, 101,55 E",
    mandor: "Kasim Ahmad",
    harvest: "31,7 ton",
    tone: "field",
  },
] as const satisfies readonly GardenBlock[];

export const recentActivities = [
  {
    title: "Ahmad Rizky mengunggah log panen Alpha-04.",
    helper: "2 menit lalu",
    tone: "leaf",
    icon: PackageCheck,
  },
  {
    title: "Truck B 4022 XS tiba di weighing station.",
    helper: "15 menit lalu",
    tone: "field",
    icon: Truck,
  },
  {
    title: "Pembayaran Blok Gamma terlambat.",
    helper: "1 jam lalu",
    tone: "danger",
    icon: AlertTriangle,
  },
  {
    title: "Rudi Hermawan ditambahkan sebagai pekerja.",
    helper: "3 jam lalu",
    tone: "sky",
    icon: UserRoundPlus,
  },
] as const satisfies readonly ActivityItem[];

export const logisticsPins = [
  { left: "18%", top: "32%" },
  { left: "39%", top: "56%" },
  { left: "58%", top: "26%" },
  { left: "77%", top: "47%" },
] as const;

export const logisticsStatus = {
  activeFleet: "8 truk",
  completion: 67,
  nextCheckpoint: "Weighing Station",
  icon: Tractor,
} as const;
