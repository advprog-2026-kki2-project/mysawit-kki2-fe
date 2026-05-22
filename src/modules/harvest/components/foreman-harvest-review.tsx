"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ImageIcon,
  MapPin,
  RefreshCcw,
  Scale,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiError } from "@/modules/auth/data/auth-api";
import {
  approveHarvest,
  getForemanHarvests,
  rejectHarvest,
} from "@/modules/harvest/data/harvest-api";
import { HarvestPhotoThumb } from "@/modules/harvest/components/harvest-photo-thumb";
import type { HarvestRecord } from "@/modules/harvest/data/types";

const statusBadgeClass: Record<string, string> = {
  APPROVED: "border-transparent bg-[#cdedae] text-[#2b4316]",
  PENDING: "border-transparent bg-[#ffe1c7] text-[#774e15]",
  REJECTED: "border-transparent bg-[#ffdad6] text-[#ba1a1a]",
};

const statusLabel: Record<string, string> = {
  APPROVED: "Disetujui",
  PENDING: "Menunggu",
  REJECTED: "Ditolak",
};

function localTodayIso() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date?: string | null) {
  if (!date) return "Hari ini";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatKg(weightKg: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(weightKg);
}

function photoPathsOf(record: HarvestRecord) {
  return record.photoPaths?.length ? record.photoPaths : record.photoPath ? [record.photoPath] : [];
}

function HarvestStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase",
        statusBadgeClass[status] ?? "border-transparent bg-[#efeee7] text-[#44483e]",
      )}
    >
      {statusLabel[status] ?? status}
    </span>
  );
}

function HarvestPhotoPreview({ record }: { record: HarvestRecord }) {
  const photos = photoPathsOf(record);

  return (
    <div className="relative">
      <HarvestPhotoThumb record={record} scope="foreman" className="min-h-32 sm:min-h-36" />
      <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2b4316] shadow-sm">
        {photos.length} bukti foto
      </span>
    </div>
  );
}

export function ForemanHarvestReview() {
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [laborerName, setLaborerName] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [selectedLaborer, setSelectedLaborer] = useState<string | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<HarvestRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayIso = localTodayIso();
  const pendingRecords = records.filter((record) => record.status === "PENDING");
  const reviewedRecords = records.filter((record) => record.status !== "PENDING");
  const todayKg = records
    .filter((record) => record.harvestDate === todayIso)
    .reduce((total, record) => total + record.weightKg, 0);
  const readyForPickupCount = records.filter((record) => record.status === "APPROVED").length;
  const approvedKg = records
    .filter((record) => record.status === "APPROVED")
    .reduce((total, record) => total + record.weightKg, 0);
  const laborerProfiles = useMemo(() => {
    const names = new Map<string, HarvestRecord[]>();
    records.forEach((record) => {
      names.set(record.laborerName, [...(names.get(record.laborerName) ?? []), record]);
    });
    return Array.from(names.entries()).map(([name, harvests]) => ({
      name,
      harvests,
      totalKg: harvests.reduce((total, record) => total + record.weightKg, 0),
    }));
  }, [records]);
  const selectedLaborerProfile = laborerProfiles.find(
    (profile) => profile.name === selectedLaborer,
  );

  async function loadHarvests() {
    setIsLoading(true);
    setError(null);

    try {
      setRecords(await getForemanHarvests({ laborerName, harvestDate }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Data panen tidak dapat dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadHarvests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadHarvests();
  }

  async function handleApprove(record: HarvestRecord) {
    setActionKey(`approve-${record.id}`);
    setError(null);
    setFeedback(null);

    try {
      const result = await approveHarvest(record.id);
      setFeedback(result.message);
      await loadHarvests();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Approval gagal.",
      );
    } finally {
      setActionKey(null);
    }
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectingRecord) return;

    const reason = rejectReason.trim();
    if (!reason) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    setActionKey(`reject-${rejectingRecord.id}`);
    setError(null);
    setFeedback(null);

    try {
      const result = await rejectHarvest(rejectingRecord.id, reason);
      setFeedback(result.message);
      setRejectReason("");
      setRejectingRecord(null);
      await loadHarvests();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Rejection gagal.",
      );
    } finally {
      setActionKey(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex min-h-24 items-center justify-between rounded-lg border border-[rgba(116,121,109,0.22)] bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="mono-label text-[#74796d]">Total KG Hari Ini</p>
            <p className="mt-2 font-[var(--font-syne)] text-3xl font-bold text-[#1a1c18]">
              {formatKg(todayKg)} <span className="text-base font-semibold">kg</span>
            </p>
          </div>
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-[#2b4316] text-white">
            <Scale className="size-5" />
          </span>
        </div>
        <div className="flex min-h-24 items-center justify-between rounded-lg border border-[rgba(116,121,109,0.22)] bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="mono-label text-[#74796d]">Menunggu Validasi</p>
            <p className="mt-2 font-[var(--font-syne)] text-3xl font-bold text-[#1a1c18]">
              {pendingRecords.length}
            </p>
          </div>
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-[#efeee7] text-[#44483e]">
            <ClipboardCheck className="size-5" />
          </span>
        </div>
        <div className="flex min-h-24 items-center justify-between rounded-lg border border-[rgba(116,121,109,0.22)] bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="mono-label text-[#74796d]">Panen Siap Angkut</p>
            <p className="mt-2 font-[var(--font-syne)] text-3xl font-bold text-[#1a1c18]">
              {readyForPickupCount}
            </p>
          </div>
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-[#ffe1c7] text-[#774e15]">
            <Truck className="size-5" />
          </span>
        </div>
      </div>

      {feedback ? (
        <p className="rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] px-4 py-3 text-sm text-[#2b4316]">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(116,121,109,0.18)] pb-3">
            <div>
              <p className="mono-label text-[#74796d]">Review Mandor</p>
              <h2 className="mt-1 font-[var(--font-syne)] text-2xl font-bold text-[#1a1c18]">
                Antrean Validasi
              </h2>
            </div>
            <Badge>Prioritas</Badge>
          </div>

          <div className="space-y-4">
            {pendingRecords.map((record) => (
              <article
                key={record.id}
                className="overflow-hidden rounded-lg border border-[rgba(116,121,109,0.22)] bg-white shadow-[0_14px_34px_rgba(119,78,21,0.08)]"
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => setSelectedLaborer(record.laborerName)}
                  >
                    <HarvestPhotoPreview record={record} />
                  </button>
                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <button
                        type="button"
                        className="min-w-0 text-left"
                        onClick={() => setSelectedLaborer(record.laborerName)}
                      >
                        <h3 className="truncate font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                          {record.laborerName}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[#44483e]">
                          <MapPin className="size-4 text-[#74796d]" />
                          {record.notes || "Catatan panen belum tersedia"}
                        </p>
                      </button>
                      <span className="flex items-center gap-1 text-sm font-medium text-[#44483e]">
                        <Clock className="size-4 text-[#74796d]" />
                        {formatDate(record.harvestDate)}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-[rgba(116,121,109,0.16)] pt-4">
                      <p className="mono-label text-[#74796d]">Berat Timbangan</p>
                      <p className="mt-1 font-[var(--font-syne)] text-3xl font-bold text-[#2b4316]">
                        {formatKg(record.weightKg)} <span className="text-base font-semibold">kg</span>
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {photoPathsOf(record).map((path, index) => (
                        <Badge key={`${record.id}-${path}`} variant="muted">
                          <ImageIcon className="mr-1 size-3" />
                          Foto {index + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-[rgba(116,121,109,0.16)] bg-[#fafaf4] px-4 py-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setRejectReason("");
                      setRejectingRecord(record);
                    }}
                    disabled={actionKey === `reject-${record.id}`}
                    className="border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/45"
                  >
                    <X className="size-4" />
                    Tolak
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleApprove(record)}
                    disabled={actionKey === `approve-${record.id}`}
                  >
                    <Check className="size-4" />
                    Setujui
                  </Button>
                </div>
              </article>
            ))}
            {pendingRecords.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[rgba(116,121,109,0.28)] bg-white px-5 py-10 text-center">
                <CheckCircle2 className="mx-auto size-9 text-[#3f6901]" />
                <p className="mt-3 font-semibold text-[#1a1c18]">Tidak ada antrean validasi.</p>
                <p className="mt-1 text-sm text-[#74796d]">
                  Semua laporan pada filter ini sudah diproses.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-4 shadow-[0_14px_34px_rgba(119,78,21,0.08)]">
          <div className="flex items-center gap-2 border-b border-[rgba(116,121,109,0.18)] pb-3">
            <RefreshCcw className="size-5 text-[#2b4316]" />
            <h2 className="font-[var(--font-syne)] text-2xl font-bold text-[#1a1c18]">
              Riwayat Validasi
            </h2>
          </div>

          <form className="mt-4 grid gap-2" onSubmit={handleFilter}>
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
              <span className="sr-only">Cari nama buruh</span>
              <Input
                value={laborerName}
                onChange={(event) => setLaborerName(event.target.value)}
                placeholder="Cari nama pekerja"
                className="pl-11"
              />
            </label>
            <DatePicker value={harvestDate} onChange={setHarvestDate} placeholder="Tanggal panen" />
            <Button type="submit" variant="secondary" disabled={isLoading} className="w-full">
              <RefreshCcw className="size-4" />
              {isLoading ? "Memuat" : "Terapkan Filter"}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            {reviewedRecords.map((record) => (
              <button
                key={record.id}
                type="button"
                className={cn(
                  "grid w-full grid-cols-[2.75rem_minmax(0,1fr)] gap-3 rounded-lg border p-3 text-left transition hover:bg-[#fafaf4]",
                  record.status === "REJECTED"
                    ? "border-[#ffb4ab] bg-[#fff7f5]"
                    : "border-[rgba(116,121,109,0.16)] bg-white",
                )}
                onClick={() => setSelectedLaborer(record.laborerName)}
              >
                <span
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-lg",
                    record.status === "REJECTED"
                      ? "bg-[#ffdad6] text-[#93000a]"
                      : "bg-[#cdedae] text-[#2b4316]",
                  )}
                >
                  {record.status === "REJECTED" ? (
                    <XCircle className="size-5" />
                  ) : (
                    <CheckCircle2 className="size-5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-[#1a1c18]">
                        {record.laborerName}
                      </span>
                      <span className="mt-1 block truncate text-sm text-[#44483e]">
                        {record.notes || "Catatan panen"} - {formatKg(record.weightKg)} kg
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-[#44483e]">
                      {formatTime(record.reviewedAt)}
                    </span>
                  </span>
                  {record.rejectionReason ? (
                    <span className="mt-2 block line-clamp-2 text-xs font-medium text-[#93000a]">
                      Alasan: {record.rejectionReason}
                    </span>
                  ) : null}
                  <span className="mt-2 inline-flex">
                    <HarvestStatusBadge status={record.status} />
                  </span>
                </span>
              </button>
            ))}
            {reviewedRecords.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[rgba(116,121,109,0.28)] px-4 py-8 text-center">
                <CalendarDays className="mx-auto size-8 text-[#74796d]" />
                <p className="mt-3 text-sm font-semibold text-[#1a1c18]">Belum ada riwayat.</p>
                <p className="mt-1 text-xs text-[#74796d]">
                  Riwayat muncul setelah laporan disetujui atau ditolak.
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-lg bg-[#f4f4ed] p-3">
            <p className="mono-label text-[#74796d]">Kg Disetujui</p>
            <p className="mt-1 font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
              {formatKg(approvedKg)} kg
            </p>
          </div>
        </aside>
      </div>

      <Dialog
        open={Boolean(rejectingRecord)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingRecord(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="bg-white sm:max-w-lg">
          <form onSubmit={handleReject}>
            <DialogHeader>
              <DialogTitle>Tolak laporan panen</DialogTitle>
              <DialogDescription>
                Beri alasan yang jelas agar buruh dapat melihat penyebab penolakan.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 rounded-lg bg-[#f4f4ed] p-3 text-sm text-[#44483e]">
              <p className="font-semibold text-[#1a1c18]">{rejectingRecord?.laborerName}</p>
              <p className="mt-1">
                {rejectingRecord ? `${formatDate(rejectingRecord.harvestDate)} - ${formatKg(rejectingRecord.weightKg)} kg` : null}
              </p>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-[#1a1c18]">Alasan penolakan</span>
              <Textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Contoh: kualitas buah belum memenuhi standar panen."
                className="mt-2 min-h-28"
              />
            </label>
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRejectingRecord(null);
                  setRejectReason("");
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="secondary"
                disabled={Boolean(rejectingRecord && actionKey === `reject-${rejectingRecord.id}`)}
                className="border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/45"
              >
                <X className="size-4" />
                Tolak Laporan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedLaborerProfile)} onOpenChange={(open) => !open && setSelectedLaborer(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto bg-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Profil Buruh: {selectedLaborerProfile?.name}</DialogTitle>
            <DialogDescription>
              Riwayat panen berdasarkan filter yang sedang aktif.
            </DialogDescription>
          </DialogHeader>
          {selectedLaborerProfile ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-[#f4f4ed] p-3">
                  <p className="mono-label text-[#74796d]">Laporan</p>
                  <p className="mt-2 text-xl font-bold text-[#1a1c18]">
                    {selectedLaborerProfile.harvests.length}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f4f4ed] p-3">
                  <p className="mono-label text-[#74796d]">Total Kg</p>
                  <p className="mt-2 text-xl font-bold text-[#1a1c18]">
                    {formatKg(selectedLaborerProfile.totalKg)}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f4f4ed] p-3">
                  <p className="mono-label text-[#74796d]">Pending</p>
                  <p className="mt-2 text-xl font-bold text-[#1a1c18]">
                    {selectedLaborerProfile.harvests.filter((record) => record.status === "PENDING").length}
                  </p>
                </div>
              </div>
              <div className="divide-y divide-[rgba(116,121,109,0.14)] rounded-lg border border-[rgba(116,121,109,0.18)]">
                {selectedLaborerProfile.harvests.map((record) => (
                  <div key={record.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-semibold text-[#1a1c18]">
                        {formatDate(record.harvestDate)} - {formatKg(record.weightKg)} kg
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#44483e]">
                        {record.notes || "Catatan panen belum tersedia."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {photoPathsOf(record).map((path, index) => (
                          <HarvestPhotoThumb
                            key={`${record.id}-profile-${path}`}
                            record={record}
                            index={index}
                            scope="foreman"
                            className="h-24 w-32 min-h-0"
                          />
                        ))}
                      </div>
                      {record.rejectionReason ? (
                        <p className="mt-2 rounded-lg bg-[#ffdad6] px-3 py-2 text-xs font-semibold text-[#93000a]">
                          {record.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                    <HarvestStatusBadge status={record.status} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
