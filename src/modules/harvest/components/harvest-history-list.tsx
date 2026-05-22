"use client";

import { useEffect, useState, useCallback } from "react";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { getLaborerHistory } from "@/modules/harvest/data/harvest-api";
import type { DailyHarvest } from "@/modules/harvest/data/types";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export function HarvestHistoryList() {
  const { session, isLoading: isAuthLoading } = useAuthSession();
  const [history, setHistory] = useState<DailyHarvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("ALL");

  const fetchHistory = useCallback(async () => {
    if (!session) return;
    setIsLoading(true); setError(null);
    try {
      const data = await getLaborerHistory(status === "ALL" ? "" : status, startDate, endDate);
      setHistory(data);
    } catch (err) {
      setError("Failed to fetch harvest history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [session, status, startDate, endDate]);

  useEffect(() => {
    if (session) fetchHistory();
  }, [session, fetchHistory]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const getStatusBadgeStyles = (harvestStatus: string) => {
    if (harvestStatus === "APPROVED") return "bg-[#DAF1E3] text-[#2F7D4C]";
    if (harvestStatus === "REJECTED") return "bg-[#FFDAD6] text-[#BA1A1A]";
    return "bg-[#F3E7D2] text-[#774E15]";
  };

  if (isAuthLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-[12px] bg-[#F0F0E8]" />
        <div className="h-64 animate-pulse rounded-[12px] bg-[#F0F0E8]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${jakarta.className}`}>
      <section className="bg-[#FFFFFF] border border-[#E8E8DF] rounded-[16px] p-6 shadow-[0_2px_8px_rgba(26,28,24,0.05)]">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight text-[#1A1C18] ${syne.className}`}>
            Harvest History
          </h2>
          <p className="mt-1 text-sm text-[#3D4038]">
            Track your daily submissions and validation statuses.
          </p>
        </div>

        <form onSubmit={handleFilterSubmit} className="mt-6 flex flex-col sm:flex-row gap-4 items-end bg-[#FFFFF1]/50 p-4 rounded-[12px] border border-[#E8E8DF]">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-[#FFFFFF] border-[#DADAD3] focus-visible:ring-[3px] focus-visible:ring-[#80B048]/30 focus-visible:border-[#2F7D4C] rounded-[8px]" />
          </div>
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-[#FFFFFF] border-[#DADAD3] focus-visible:ring-[3px] focus-visible:ring-[#80B048]/30 focus-visible:border-[#2F7D4C] rounded-[8px]" />
          </div>
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-[44px] w-full rounded-[8px] border border-[#DADAD3] bg-[#FFFFFF] px-3 py-2 text-sm text-[#1A1C18] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#80B048]/30 focus-visible:border-[#2F7D4C]">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <Button type="submit" className="w-full sm:w-auto bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] rounded-[8px] font-bold shadow-[0_1px_2px_rgba(26,28,24,0.08)] min-h-[44px]">
            Apply Filters
          </Button>
        </form>
      </section>

      <section>
        {error && (
          <div className="mb-6 rounded-[8px] border border-[#BA1A1A]/20 bg-[#FFDAD6] px-4 py-3 text-sm font-medium text-[#BA1A1A]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="h-48 animate-pulse rounded-[16px] bg-[#F0F0E8]" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#DADAD3] px-5 py-16 text-center bg-[#FFFFF1]/40">
            <p className="text-sm font-medium text-[#5F6358]">No harvest records found for the selected filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((record) => (
              <div key={record.id} className="bg-[#FFFFFF] border border-[#E8E8DF] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(26,28,24,0.05)] hover:shadow-[0_8px_24px_rgba(26,28,24,0.08)] transition-shadow flex flex-col">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[11px] font-mono font-bold tracking-wider text-[#5F6358] uppercase">{record.harvestDate}</p>
                    <p className={`mt-1 text-4xl font-extrabold text-[#415B2B] tracking-tight ${syne.className}`}>
                      {record.weightKg} <span className={`text-base font-semibold text-[#5F6358] ${jakarta.className}`}>kg</span>
                    </p>
                  </div>
                  <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase ${getStatusBadgeStyles(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                {record.photoUrls && record.photoUrls.length > 0 && (
  <div className="mb-4 grid grid-cols-2 gap-2">
    {record.photoUrls.map((url, index) => (
      <div key={index} className="w-full h-[140px] bg-[#F0F0E8] rounded-[8px] overflow-hidden border border-[#E8E8DF] shrink-0">
        <img
          src={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${url}`}
          alt={`Harvest Evidence ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
        />
      </div>
    ))}
  </div>
)}

                <div className="mt-auto pt-4 border-t border-[#E8E8DF]">
                  <p className="text-sm leading-6 text-[#3D4038] line-clamp-2">{record.notes}</p>
                </div>
                
                {record.status === "REJECTED" && record.rejectionReason && (
                  <div className="mt-4 rounded-[8px] border border-[#BA1A1A]/20 bg-[#FFDAD6] p-3">
                    <p className="text-[11px] font-mono font-bold tracking-wider text-[#BA1A1A] uppercase mb-1">Rejection Reason</p>
                    <p className="text-sm font-medium text-[#BA1A1A]">{record.rejectionReason}</p>
                  </div>
                )}
                
                {record.status === "APPROVED" && record.reviewedBy && (
                  <div className="mt-4 rounded-[8px] border border-[#2F7D4C]/20 bg-[#DAF1E3]/50 p-3">
                    <p className="text-[11px] font-mono font-bold tracking-wider text-[#2F7D4C] uppercase mb-1">Validated By</p>
                    <p className="text-sm font-medium text-[#2F7D4C]">Foreman {record.reviewedBy}</p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}