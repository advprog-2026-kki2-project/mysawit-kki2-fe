"use client";

import { useState, type FormEvent } from "react";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/modules/auth/data/auth-api";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { submitHarvest } from "@/modules/harvest/data/harvest-api";
import type { HarvestSubmissionResult } from "@/modules/harvest/data/types";

const syne = Syne({ subsets: ["latin"], weight: ["700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#80B048] mb-4 opacity-80">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export function HarvestSubmitForm() {
  const { isLoading } = useAuthSession();
  const [harvestDate, setHarvestDate] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [result, setResult] = useState<HarvestSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (photos.length === 0) {
      setError("At least one photo evidence is required.");
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
      setHarvestDate("");
      setWeightKg("");
      setNotes("");
      setPhotos([]);
      setPhotoInputKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Failed to submit harvest record."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-[16px]">
        <div className="h-[48px] animate-pulse rounded-[12px] bg-[#F0F0E8]" />
        <div className="h-[280px] animate-pulse rounded-[16px] bg-[#F0F0E8]" />
      </div>
    );
  }

  return (
    <div className={`grid gap-[24px] lg:grid-cols-[0.9fr_1.1fr] ${jakarta.className}`}>
      <section className="bg-[#FFFFFF] border border-[#E8E8DF] rounded-[16px] p-[24px] shadow-[0_2px_8px_rgba(26,28,24,0.05)] hover:shadow-[0_8px_24px_rgba(26,28,24,0.08)] transition-shadow duration-160">
        <p className="text-[12px] font-mono font-bold tracking-[0.08em] text-[#5F6358] uppercase">Harvest Form</p>

        <h2 className={`mt-[12px] text-[22px] font-bold leading-[1.2] tracking-[-0.4px] text-[#1A1C18] ${syne.className}`}>
          Record Today's Harvest
        </h2>

        <p className="mt-[8px] text-[16px] leading-[1.6] text-[#3D4038]">
          The laborer name will be automatically bound to your active session identity.
        </p>

        <form className="mt-[32px] space-y-[16px]" onSubmit={handleSubmit}>
          <div className="space-y-[8px]">
            <label className="text-[14px] font-semibold text-[#3D4038]">Harvest Date</label>
            <Input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className={`h-[44px] px-[14px] bg-[#FFFFF1] border-[#DADAD3] rounded-[8px] text-[16px] text-[#1A1C18] focus-visible:border-[#2F7D4C] focus-visible:ring-[3px] focus-visible:ring-[#80B048]/28 ${jakarta.className}`}
              required
            />
          </div>

          <div className="space-y-[8px]">
            <label className="text-[14px] font-semibold text-[#3D4038]">Harvest Weight (kg)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="120.5"
              className={`h-[44px] px-[14px] bg-[#FFFFF1] border-[#DADAD3] rounded-[8px] text-[16px] text-[#1A1C18] focus-visible:border-[#2F7D4C] focus-visible:ring-[3px] focus-visible:ring-[#80B048]/28 ${jakarta.className}`}
              required
            />
          </div>

          <div className="space-y-[8px]">
            <label className="text-[14px] font-semibold text-[#3D4038]">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter harvest conditions or specific block notes."
              className={`p-[14px] bg-[#FFFFF1] border-[#DADAD3] rounded-[8px] text-[16px] text-[#1A1C18] focus-visible:border-[#2F7D4C] focus-visible:ring-[3px] focus-visible:ring-[#80B048]/28 min-h-[96px] resize-none ${jakarta.className}`}
              required
            />
          </div>

          <div className="space-y-[8px]">
  <label className="text-[14px] font-semibold text-[#3D4038]">Photo Evidence</label>

  <div className="relative border-[1.5px] border-dashed border-[#DADAD3] rounded-[8px] p-[16px] bg-[#FFFFF1] text-center hover:bg-[#F6FBEF] transition-colors cursor-pointer min-h-[72px] flex items-center justify-center">
    <Input
      key={photoInputKey}
      type="file"
      accept="image/*"
      multiple
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      onChange={(e) => {
        const selectedFiles = Array.from(e.target.files ?? []);

        setPhotos((currentPhotos) => {
          const existingKeys = new Set(
            currentPhotos.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
          );

          const newFiles = selectedFiles.filter(
            (file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`)
          );

          return [...currentPhotos, ...newFiles];
        });

        e.target.value = "";
      }}
      required={photos.length === 0}
    />

    <p className="text-[13px] font-medium text-[#3D4038]">
      {photos.length > 0 ? `${photos.length} photo(s) selected` : "+ Add photo evidence"}
    </p>
  </div>

  {photos.length > 0 && (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo, index) => (
        <div
          key={`${photo.name}-${photo.size}-${photo.lastModified}`}
          className="rounded-[8px] border border-[#E8E8DF] bg-white p-2"
        >
          <p className="truncate text-[12px] font-medium text-[#3D4038]">
            {index + 1}. {photo.name}
          </p>

          <button
            type="button"
            onClick={() => {
              setPhotos((currentPhotos) => currentPhotos.filter((_, photoIndex) => photoIndex !== index));
            }}
            className="mt-1 text-[12px] font-semibold text-[#BA1A1A]"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>

          <div className="pt-[12px]">
            <Button
              className={`w-full bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] rounded-[8px] font-bold text-[14px] min-h-[44px] shadow-[0_1px_2px_rgba(26,28,24,0.08)] disabled:bg-[#F0F0E8] disabled:text-[#8A8D83] ${jakarta.className}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Harvest"}
            </Button>
          </div>
        </form>

        {error && (
          <p className="mt-[16px] rounded-[8px] border border-[#BA1A1A]/20 bg-[#FFDAD6] px-[16px] py-[12px] text-[14px] font-medium text-[#BA1A1A]">
            {error}
          </p>
        )}
      </section>

      <section className="bg-[#FFFFFF] border border-[#E8E8DF] rounded-[16px] p-[24px] shadow-[0_2px_8px_rgba(26,28,24,0.05)] hover:shadow-[0_8px_24px_rgba(26,28,24,0.08)] transition-shadow duration-160 flex flex-col">
        <p className="text-[12px] font-mono font-bold tracking-[0.08em] text-[#5F6358] uppercase">Submission Status</p>

        <h2 className={`mt-[12px] text-[22px] font-bold leading-[1.2] tracking-[-0.4px] text-[#1A1C18] ${syne.className}`}>
          Submission Summary
        </h2>

        <p className="mt-[8px] text-[16px] leading-[1.6] text-[#3D4038]">
          Review details of your harvest record after submission.
        </p>

        {result ? (
          <div className="mt-[32px] rounded-[12px] border border-[#2F7D4C]/20 bg-[#DAF1E3] p-[20px]">
            <p className="text-[14px] font-semibold text-[#2F7D4C]">{result.message}</p>

            <div className="mt-[20px] grid gap-[12px] sm:grid-cols-2">
              <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E8E8DF] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(26,28,24,0.08)]">
                <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Laborer</p>
                <p className="mt-[4px] text-[14px] font-bold text-[#1A1C18]">{result.laborerName}</p>
              </div>

              <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E8E8DF] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(26,28,24,0.08)]">
                <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Status</p>
                <span className={`inline-flex items-center justify-center min-h-[24px] mt-[4px] px-[10px] py-[2px] rounded-[9999px] text-[11px] font-mono font-bold tracking-[0.06em] uppercase ${
                  result.status === "APPROVED" ? "bg-[#DAF1E3] text-[#2F7D4C]" :
                  result.status === "REJECTED" ? "bg-[#FFDAD6] text-[#BA1A1A]" :
                  "bg-[#F3E7D2] text-[#774E15]"
                }`}>
                  {result.status}
                </span>
              </div>

              <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E8E8DF] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(26,28,24,0.08)]">
                <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Date</p>
                <p className="mt-[4px] text-[14px] font-bold text-[#1A1C18]">{result.harvestDate}</p>
              </div>

              <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E8E8DF] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(26,28,24,0.08)]">
                <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Weight</p>
                <p className="mt-[4px] text-[14px] font-bold text-[#415B2B]">{result.weightKg} kg</p>
              </div>
            </div>

            {result.photoUrls && result.photoUrls.length > 0 && (
              <div className="mt-[12px] rounded-[8px] bg-[#FFFFFF] border border-[#E8E8DF] p-[8px] shadow-[0_1px_2px_rgba(26,28,24,0.08)]">
                <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase px-[8px] pb-[8px]">
                  Photo Evidence
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {result.photoUrls.map((url, index) => (
                    <div key={index} className="w-full h-[140px] bg-[#F0F0E8] rounded-[6px] overflow-hidden border border-[#E8E8DF]">
                      <img
                        src={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${url}`}
                        alt={`Harvest Evidence ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-[12px] rounded-[8px] bg-[#FFFFFF] border border-[#E8E8DF] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(26,28,24,0.08)]">
              <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Notes</p>
              <p className="mt-[4px] text-[14px] leading-[1.6] text-[#3D4038]">{result.notes}</p>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-[32px] flex-1 flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#DADAD3] p-[24px] text-center bg-[#FFFFF1]/40">
            <LeafIcon />
            <p className="text-[16px] font-medium text-[#5F6358]">No harvest submitted today.</p>
          </div>
        )}
      </section>
    </div>
  );
}