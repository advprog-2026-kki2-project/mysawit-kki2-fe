"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/modules/auth/data/auth-api";
import { roleLabels } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { submitHarvest } from "@/modules/harvest/data/harvest-api";
import type { HarvestSubmissionResult } from "@/modules/harvest/data/types";

export function HarvestSubmitForm() {
  const { session, isLoading } = useAuthSession();
  const [harvestDate, setHarvestDate] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState<HarvestSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!harvestDate) {
      setError("Tanggal panen wajib dipilih.");
      return;
    }

    if (!photo) {
      setError("Foto bukti wajib diunggah.");
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
        photo,
      });
      setResult(submissionResult);
      setHarvestDate("");
      setWeightKg("");
      setNotes("");
      setPhoto(null);
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Panen gagal dikirim.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-lg bg-[#e3e3dc]" />
        <div className="h-72 animate-pulse rounded-lg bg-[#e3e3dc]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="surface-panel rounded-lg p-6">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
          Login diperlukan.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#44483e]">
          Masuk sebagai pekerja untuk mengirim data panen.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    );
  }

  if (session.role !== "LABORER") {
    return (
      <div className="surface-panel rounded-lg p-6">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
          Akses dibatasi.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#44483e]">
          Form panen hanya tersedia untuk pekerja. Sesi aktif Anda menggunakan
          role {roleLabels[session.role].toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="surface-panel rounded-lg p-6 sm:p-7">
        <p className="mono-label text-[#74796d]">Harvest Form</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
          Catat panen hari ini.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#44483e]">
          Nama pekerja akan diambil dari sesi backend yang aktif.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44483e]" htmlFor="harvest-date">
              Tanggal panen
            </label>
            <DatePicker
              id="harvest-date"
              value={harvestDate}
              onChange={setHarvestDate}
              placeholder="Pilih tanggal panen"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44483e]" htmlFor="weight-kg">
              Berat panen (kg)
            </label>
            <Input
              id="weight-kg"
              type="number"
              min="0"
              step="0.01"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
              placeholder="120.5"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44483e]" htmlFor="harvest-notes">
              Catatan
            </label>
            <Textarea
              id="harvest-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Tuliskan kondisi panen hari ini."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44483e]" htmlFor="harvest-photo">
              Foto bukti
            </label>
            <FileUpload
              id="harvest-photo"
              accept="image/*"
              value={photo}
              onChange={setPhoto}
              isUploading={isSubmitting}
              uploadText="Upload foto bukti panen"
              helperText="Format gambar, maksimum 30MB"
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Kirim panen"}
          </Button>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">
            {error}
          </p>
        ) : null}
      </section>

      <section className="surface-panel rounded-lg p-6 sm:p-7">
        <p className="mono-label text-[#74796d]">Submission Status</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#1a1c18]">
          Ringkasan pengiriman panen.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#44483e]">
          Backend saat ini sudah mendukung submit panen beserta upload foto.
        </p>

        {result ? (
          <div className="mt-8 rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] p-5">
            <p className="text-sm font-medium text-[#1a1c18]">{result.message}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white px-4 py-3">
                <p className="mono-label text-[#74796d]">Pekerja</p>
                <p className="mt-2 text-sm font-medium text-[#1a1c18]">
                  {result.laborerName}
                </p>
              </div>
              <div className="rounded-lg bg-white px-4 py-3">
                <p className="mono-label text-[#74796d]">Status</p>
                <p className="mt-2 text-sm font-medium text-[#1a1c18]">
                  {result.status}
                </p>
              </div>
              <div className="rounded-lg bg-white px-4 py-3">
                <p className="mono-label text-[#74796d]">Tanggal</p>
                <p className="mt-2 text-sm font-medium text-[#1a1c18]">
                  {result.harvestDate}
                </p>
              </div>
              <div className="rounded-lg bg-white px-4 py-3">
                <p className="mono-label text-[#74796d]">Berat</p>
                <p className="mt-2 text-sm font-medium text-[#1a1c18]">
                  {result.weightKg} kg
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-white px-4 py-3">
              <p className="mono-label text-[#74796d]">Catatan</p>
              <p className="mt-2 text-sm leading-7 text-[#44483e]">{result.notes}</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-[rgba(116,121,109,0.40)] px-5 py-8 text-sm text-[#44483e]">
            Belum ada pengiriman panen di sesi ini.
          </div>
        )}
      </section>
    </div>
  );
}
