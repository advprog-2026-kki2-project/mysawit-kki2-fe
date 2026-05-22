"use client";

import { useEffect, useState, type FormEvent } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/modules/auth/data/auth-api";
import { getLaborerHarvestHistory } from "@/modules/harvest/data/harvest-api";
import { HarvestPhotoThumb } from "@/modules/harvest/components/harvest-photo-thumb";
import type { HarvestRecord } from "@/modules/harvest/data/types";
import { cn } from "@/lib/utils";

const statusOptions = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

type HarvestHistoryPanelProps = {
  refreshKey?: number;
  onRecordsLoaded?: (records: HarvestRecord[]) => void;
};

const statusStyles: Record<string, string> = {
  APPROVED: "bg-[#cdedae] text-[#2b4316]",
  PENDING: "bg-[#ffe1c7] text-[#774e15]",
  REJECTED: "bg-[#ffdad6] text-[#ba1a1a]",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

export function HarvestHistoryPanel({
  refreshKey = 0,
  onRecordsLoaded,
}: HarvestHistoryPanelProps) {
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getLaborerHarvestHistory({
        status: status === "ALL" ? undefined : status,
        startDate,
        endDate,
      });
      setRecords(result);
      onRecordsLoaded?.(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Riwayat panen tidak dapat dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadHistory();
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[#c4c8ba]/70 bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="flex flex-col gap-3 border-b border-[#c4c8ba]/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
            Harvest History
          </h2>
          <p className="mt-1 text-sm text-[#74796d]">
            Riwayat laporan dan keputusan mandor.
          </p>
        </div>

        <form className="grid gap-2 sm:grid-cols-[1fr_1fr_9rem_auto]" onSubmit={handleFilter}>
          <DatePicker value={startDate} onChange={setStartDate} placeholder="Mulai" />
          <DatePicker value={endDate} onChange={setEndDate} placeholder="Akhir" />
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as (typeof statusOptions)[number])}
          >
            <SelectTrigger className="h-10 w-full px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "ALL" ? "Semua" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" variant="secondary" disabled={isLoading}>
            <RefreshCcw className="size-4" />
            {isLoading ? "Memuat" : "Filter"}
          </Button>
        </form>
      </div>

      {error ? (
        <p className="m-5 rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[50rem] text-left text-sm">
          <thead className="bg-[#f4f4ed] text-xs uppercase tracking-[0.01em] text-[#74796d]">
            <tr>
              <th className="px-5 py-3 font-bold">Photo</th>
              <th className="px-5 py-3 font-bold">Date</th>
              <th className="px-5 py-3 font-bold">Notes</th>
              <th className="px-5 py-3 text-right font-bold">Weight (kg)</th>
              <th className="px-5 py-3 text-right font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4c8ba]/60">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[#74796d]">
                  Belum ada riwayat panen.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td className="w-32 px-5 py-4">
                    {photoPathsOf(record).length ? (
                      <HarvestPhotoThumb
                        record={record}
                        scope="laborer"
                        className="h-20 w-28 min-h-0"
                      />
                    ) : (
                      <span className="text-xs text-[#74796d]">Tidak ada foto</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#1a1c18]">
                    {formatDate(record.harvestDate)}
                  </td>
                  <td className="px-5 py-4 text-[#44483e]">
                    <p className="line-clamp-2">{record.notes}</p>
                    {record.rejectionReason ? (
                      <p className="mt-2 rounded-lg bg-[#ffdad6] px-3 py-2 text-xs font-semibold text-[#93000a]">
                        Alasan: {record.rejectionReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-[#1a1c18]">
                    {formatKg(record.weightKg)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase",
                        statusStyles[record.status] ?? "bg-[#efeee7] text-[#44483e]",
                      )}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
