"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/modules/auth/data/auth-api";
import { submitHarvest } from "@/modules/harvest/data/harvest-api";
import type { HarvestSubmissionResult } from "@/modules/harvest/data/types";

type HarvestSubmitFormProps = {
  onSubmitted?: (result: HarvestSubmissionResult) => void;
  isTodaySubmitted?: boolean;
  todaySubmittedStatus?: string | null;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function HarvestSubmitForm({
  isTodaySubmitted = false,
  onSubmitted,
  todaySubmittedStatus,
}: HarvestSubmitFormProps) {
  const [harvestDate, setHarvestDate] = useState(todayIsoDate());
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [result, setResult] = useState<HarvestSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!harvestDate) {
      setError("Tanggal panen wajib dipilih.");
      return;
    }

    if (isTodaySubmitted) {
      setError("Laporan panen hari ini sudah tersimpan. Silakan menunggu besok.");
      return;
    }

    if (photos.length < 1) {
      setError("Unggah minimal 1 foto bukti panen.");
      return;
    }

    setResult(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const submissionResult = await submitHarvest({
        harvestDate,
        weightKg,
        notes,
        photos,
      });
      setResult(submissionResult);
      setHarvestDate(todayIsoDate());
      setWeightKg("");
      setNotes("");
      setPhotos([]);
      onSubmitted?.(submissionResult);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Panen gagal dikirim.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[#c4c8ba]/70 bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="border-b border-[#c4c8ba]/70 bg-[#203b28] px-5 py-4 text-white">
        <h2 className="font-[var(--font-syne)] text-lg font-bold">
          Catat Panen Hari Ini
        </h2>
        {isTodaySubmitted ? (
          <p className="mt-1 text-sm text-white/75">
            Laporan hari ini sudah tersimpan dengan status {todaySubmittedStatus ?? "PENDING"}.
          </p>
        ) : null}
      </div>

      <form className="space-y-5 p-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.01em] text-[#74796d]">
              Kilogram sawit dipanen
            </span>
            <Input
              id="weight-kg"
              type="number"
              min="0"
              step="0.01"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
              placeholder="0.00"
              disabled={isSubmitting || isTodaySubmitted}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.01em] text-[#74796d]">
              Tanggal panen
            </span>
            <DatePicker
              id="harvest-date"
              value={harvestDate}
              onChange={setHarvestDate}
              placeholder="Pilih tanggal panen"
              disabled={isSubmitting || isTodaySubmitted}
            />
          </label>
        </div>

        <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.01em] text-[#74796d]">
            Berita hasil panen
          </span>
          <Textarea
            id="harvest-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Catat kondisi lapangan, kendala akses, atau kualitas panen."
            className="min-h-28"
            disabled={isSubmitting || isTodaySubmitted}
            required
          />
        </label>

        <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.01em] text-[#74796d]">
            Bukti foto
          </p>
          <FileUpload
            id="harvest-photos"
            accept="image/*"
            value={photos}
            onChange={(files) => {
              setPhotos(Array.isArray(files) ? files : files ? [files] : []);
              setError(null);
            }}
            multiple
            maxFiles={6}
            isUploading={isSubmitting || isTodaySubmitted}
            uploadText="Upload foto bukti panen"
            helperText="Pilih minimal 1 foto, maksimal 6 foto, masing-masing 30MB"
            required
          />
          <p className="text-sm text-[#74796d]">
            Foto bukti diperlukan untuk setiap laporan panen.
          </p>
        </div>

        <Button className="w-full" type="submit" disabled={isSubmitting || isTodaySubmitted}>
          <Send className="size-4" />
          {isTodaySubmitted
            ? "Laporan hari ini sudah ada"
            : isSubmitting
              ? "Mengirim laporan..."
              : "Kirim laporan panen"}
        </Button>
      </form>

      {error ? (
        <p className="mx-5 mb-5 rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">
          {error}
        </p>
      ) : null}

      {result ? (
        <p className="mx-5 mb-5 rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] px-4 py-3 text-sm text-[#1a1c18]">
          Laporan {result.weightKg} kg untuk {result.harvestDate} berhasil dikirim
          dan menunggu review mandor.
        </p>
      ) : null}
    </section>
  );
}
