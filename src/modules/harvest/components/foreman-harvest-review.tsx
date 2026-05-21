"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, RefreshCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/modules/auth/data/auth-api";
import {
  approveHarvest,
  getForemanHarvests,
  rejectHarvest,
} from "@/modules/harvest/data/harvest-api";
import type { HarvestRecord } from "@/modules/harvest/data/types";

export function ForemanHarvestReview() {
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [laborerName, setLaborerName] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    }
  }

  async function handleReject(record: HarvestRecord) {
    const reason = rejectReasons[record.id]?.trim();
    if (!reason) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      const result = await rejectHarvest(record.id, reason);
      setFeedback(result.message);
      setRejectReasons((current) => ({ ...current, [record.id]: "" }));
      await loadHarvests();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Rejection gagal.",
      );
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-white p-6 shadow-[0_2px_4px_rgba(13,13,13,0.03)]">
      <p className="mono-label text-[#888888]">Review Mandor</p>
      <h2 className="mt-3 text-2xl font-semibold text-[#0d0d0d]">
        Validasi hasil panen.
      </h2>

      <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto]" onSubmit={handleFilter}>
        <Input
          value={laborerName}
          onChange={(event) => setLaborerName(event.target.value)}
          placeholder="Cari nama buruh"
        />
        <DatePicker value={harvestDate} onChange={setHarvestDate} placeholder="Tanggal panen" />
        <Button type="submit" disabled={isLoading}>
          <RefreshCcw className="size-4" />
          {isLoading ? "Memuat..." : "Filter"}
        </Button>
      </form>

      {feedback ? (
        <p className="mt-4 rounded-[1.25rem] border border-[rgba(24,226,153,0.18)] bg-[rgba(212,250,232,0.55)] px-4 py-3 text-sm">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-[1.25rem] border border-[rgba(212,86,86,0.25)] bg-[rgba(212,86,86,0.06)] px-4 py-3 text-sm text-[#a54141]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {records.map((record) => (
          <article key={record.id} className="rounded-[1.25rem] border border-[rgba(13,13,13,0.05)] bg-[#fbfdfc] p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
              <div>
                <p className="text-sm font-semibold text-[#0d0d0d]">
                  {record.laborerName} · {record.harvestDate} · {record.weightKg} kg
                </p>
                <p className="mt-2 text-sm leading-6 text-[#666666]">{record.notes}</p>
                <p className="mt-2 text-xs font-medium text-[#888888]">
                  Status: {record.status}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={record.status !== "PENDING"}
                    onClick={() => void handleApprove(record)}
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={record.status !== "PENDING"}
                    onClick={() => void handleReject(record)}
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                </div>
                <Textarea
                  value={rejectReasons[record.id] ?? ""}
                  onChange={(event) =>
                    setRejectReasons((current) => ({
                      ...current,
                      [record.id]: event.target.value,
                    }))
                  }
                  placeholder="Alasan penolakan"
                  className="min-h-20 rounded-[1rem]"
                  disabled={record.status !== "PENDING"}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
