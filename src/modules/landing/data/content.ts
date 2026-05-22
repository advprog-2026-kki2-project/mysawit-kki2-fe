import {
  BriefcaseBusiness,
  ClipboardCheck,
  ShieldCheck,
  Tractor,
  Truck,
  Users,
  Waves,
} from "lucide-react";

export const landingStats = [
  { value: "4", label: "Role aktif" },
  { value: "3", label: "Tahap pantau" },
  { value: "24/7", label: "Akses status" },
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
    body: "Panen, angkut, dan approval tersusun dalam satu alur kerja yang mudah ditelusuri.",
  },
  {
    icon: ShieldCheck,
    title: "Atur akses",
    body: "Setiap pengguna melihat menu dan aksi yang sesuai dengan tanggung jawabnya.",
  },
  {
    icon: Users,
    title: "Lihat status",
    body: "Tim lapangan dan admin pusat bisa memantau progres tanpa menunggu laporan manual.",
  },
];

export const workflowSteps = [
  "Panen dicatat",
  "Mandor validasi",
  "Supir angkut",
  "Admin monitor",
];

export const previewTasks = [
  {
    title: "Panen Blok A-17",
    meta: "32 tandan siap validasi",
    status: "Mandor",
  },
  {
    title: "Pickup TPH Timur",
    meta: "Supir menuju lokasi",
    status: "Angkut",
  },
  {
    title: "Approval Harian",
    meta: "Ringkasan masuk pusat",
    status: "Admin",
  },
];

export const trustPoints = [
  {
    icon: ClipboardCheck,
    title: "Data lebih rapi",
    body: "Catatan lapangan dibuat terstruktur sejak awal.",
  },
  {
    icon: Truck,
    title: "Koordinasi cepat",
    body: "Pengangkutan terlihat jelas dari pickup sampai selesai.",
  },
  {
    icon: ShieldCheck,
    title: "Approval terkontrol",
    body: "Admin pusat memantau pekerjaan dengan jejak status.",
  },
];
