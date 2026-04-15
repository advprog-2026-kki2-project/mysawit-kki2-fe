import {
  BriefcaseBusiness,
  ShieldCheck,
  Tractor,
  Truck,
  Users,
  Waves,
} from "lucide-react";

export const landingStats = [
  { value: "4", label: "Role utama" },
  { value: "1", label: "Platform terpadu" },
  { value: "24/7", label: "Monitoring alur" },
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
    title: "Alur kerja lebih rapi",
    body: "Panen, angkut, dan approval tersambung dalam satu flow visual.",
  },
  {
    icon: ShieldCheck,
    title: "Akses sesuai peran",
    body: "Setiap pengguna bekerja di area yang memang menjadi tanggung jawabnya.",
  },
  {
    icon: Users,
    title: "Koordinasi lebih jelas",
    body: "Semua pihak melihat status yang sama tanpa pindah-pindah sistem.",
  },
];

export const workflowSteps = [
  "Panen dicatat",
  "Mandor validasi",
  "Supir angkut",
  "Admin monitor",
];
