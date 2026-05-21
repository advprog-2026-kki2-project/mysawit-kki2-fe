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
import type { HarvestRecord } from "@/modules/harvest/data/types";

const statusOptions = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export function HarvestHistoryPanel() {
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
      setRecords(
        await getLaborerHarvestHistory({
          status: status === "ALL" ? undefined : status,
          startDate,
          endDate,
        }),
      );
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
  }, []);

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadHistory();
  }

  return (
    <section className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-white p-6 shadow-[0_2px_4px_rgba(13,13,13,0.03)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mono-label text-[#888888]">Riwayat</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#0d0d0d]">
            Riwayat panen saya.
          </h2>
        </div>
      </div>

      <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_12rem_auto]" onSubmit={handleFilter}>
        <DatePicker value={startDate} onChange={setStartDate} placeholder="Tanggal mulai" />
        <DatePicker value={endDate} onChange={setEndDate} placeholder="Tanggal akhir" />
        <Select value={status} onValueChange={(value) => setStatus(value as (typeof statusOptions)[number])}>
          <SelectTrigger className="h-12 w-full px-5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "ALL" ? "Semua status" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isLoading}>
          <RefreshCcw className="size-4" />
          {isLoading ? "Memuat..." : "Filter"}
        </Button>
      </form>

      {error ? (
        <p className="mt-4 rounded-[1.25rem] border border-[rgba(212,86,86,0.25)] bg-[rgba(212,86,86,0.06)] px-4 py-3 text-sm text-[#a54141]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {records.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-[rgba(13,13,13,0.1)] px-5 py-7 text-sm text-[#666666]">
            Belum ada riwayat panen.
          </div>
        ) : (
          records.map((record) => (
            <article key={record.id} className="rounded-[1.25rem] border border-[rgba(13,13,13,0.05)] bg-[#fbfdfc] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0d0d0d]">
                    {record.harvestDate} · {record.weightKg} kg
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#666666]">{record.notes}</p>
                  {record.rejectionReason ? (
                    <p className="mt-2 text-sm text-[#a54141]">
                      Alasan: {record.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full border border-[rgba(13,13,13,0.06)] bg-white px-3 py-1 text-xs font-medium text-[#333333]">
                  {record.status}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
