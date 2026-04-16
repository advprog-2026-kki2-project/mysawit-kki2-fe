"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
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
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [result, setResult] = useState<HarvestSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      setPhotoInputKey((current) => current + 1);
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
        <div className="h-12 animate-pulse rounded-[1.5rem] bg-[#f5f5f5]" />
        <div className="h-72 animate-pulse rounded-[1.5rem] bg-[#f5f5f5]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="surface-panel rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Login diperlukan.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
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
      <div className="surface-panel rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Akses dibatasi.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
          Form panen hanya tersedia untuk pekerja. Sesi aktif Anda menggunakan
          role {roleLabels[session.role].toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-7">
        <p className="mono-label text-[#888888]">Harvest Form</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Catat panen hari ini.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
          Nama pekerja akan diambil dari sesi backend yang aktif.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#333333]" htmlFor="harvest-date">
              Tanggal panen
            </label>
            <Input
              id="harvest-date"
              type="date"
              value={harvestDate}
              onChange={(event) => setHarvestDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#333333]" htmlFor="weight-kg">
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
            <label className="text-sm font-medium text-[#333333]" htmlFor="harvest-notes">
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
            <label className="text-sm font-medium text-[#333333]" htmlFor="harvest-photo">
              Foto bukti
            </label>
            <Input
              key={photoInputKey}
              id="harvest-photo"
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Kirim panen"}
          </Button>
        </form>

        {error ? (
          <p className="mt-4 rounded-[1.3rem] border border-[rgba(212,86,86,0.25)] bg-[rgba(212,86,86,0.06)] px-4 py-3 text-sm text-[#a54141]">
            {error}
          </p>
        ) : null}
      </section>

      <section className="surface-panel rounded-[2rem] p-6 sm:p-7">
        <p className="mono-label text-[#888888]">Submission Status</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Ringkasan pengiriman panen.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
          Backend saat ini sudah mendukung submit panen beserta upload foto.
        </p>

        {result ? (
          <div className="mt-8 rounded-[1.6rem] border border-[rgba(24,226,153,0.18)] bg-[rgba(212,250,232,0.55)] p-5">
            <p className="text-sm font-medium text-[#0d0d0d]">{result.message}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-white px-4 py-3">
                <p className="mono-label text-[#888888]">Pekerja</p>
                <p className="mt-2 text-sm font-medium text-[#0d0d0d]">
                  {result.laborerName}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-white px-4 py-3">
                <p className="mono-label text-[#888888]">Status</p>
                <p className="mt-2 text-sm font-medium text-[#0d0d0d]">
                  {result.status}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-white px-4 py-3">
                <p className="mono-label text-[#888888]">Tanggal</p>
                <p className="mt-2 text-sm font-medium text-[#0d0d0d]">
                  {result.harvestDate}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-white px-4 py-3">
                <p className="mono-label text-[#888888]">Berat</p>
                <p className="mt-2 text-sm font-medium text-[#0d0d0d]">
                  {result.weightKg} kg
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-[1.25rem] bg-white px-4 py-3">
              <p className="mono-label text-[#888888]">Catatan</p>
              <p className="mt-2 text-sm leading-7 text-[#333333]">{result.notes}</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-[rgba(13,13,13,0.1)] px-5 py-8 text-sm text-[#666666]">
            Belum ada pengiriman panen di sesi ini.
          </div>
        )}
      </section>
    </div>
  );
}
