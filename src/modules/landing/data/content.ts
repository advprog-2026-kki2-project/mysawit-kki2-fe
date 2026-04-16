import {
  BriefcaseBusiness,
  ShieldCheck,
  Tractor,
  Truck,
  Users,
  Waves,
} from "lucide-react";

export const landingStats = [
  { value: "4", label: "Role" },
  { value: "1", label: "Alur kerja" },
  { value: "24/7", label: "Status" },
];

export const roleCards = [
  {
    icon: Tractor,
    title: "Pekerja Sawit",
    body: "Catat panen harian dengan cepat dan rapi.",
  },
  {
    icon: Users,
    title: "Mandor",
    body: "Validasi hasil panen dan atur pengangkutan.",
  },
  {
    icon: Truck,
    title: "Supir",
    body: "Pantau pickup hingga pengantaran secara berurutan.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Admin Pusat",
    body: "Kelola pengguna, pantau proses, dan lakukan approval.",
  },
];

export const featureCards = [
  {
    icon: Waves,
    title: "Catat proses",
    body: "Kelola panen, angkut, dan approval dalam satu alur.",
  },
  {
    icon: ShieldCheck,
    title: "Atur akses",
    body: "Setiap pengguna bekerja sesuai role.",
  },
  {
    icon: Users,
    title: "Lihat status",
    body: "Pantau progres kerja di satu tempat.",
  },
];

export const workflowSteps = [
  "Panen dicatat",
  "Mandor validasi",
  "Supir angkut",
  "Admin monitor",
];
