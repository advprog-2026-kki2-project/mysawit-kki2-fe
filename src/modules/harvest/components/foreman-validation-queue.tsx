"use client";

import { useEffect, useState, useCallback } from "react";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { getForemanHarvests, approveHarvest, rejectHarvest } from "@/modules/harvest/data/harvest-api";
import type { HarvestRecord } from "@/modules/harvest/data/types";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#80B048] mb-4 opacity-80">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

export function ForemanValidationQueue() {
  const { session, isLoading: isAuthLoading } = useAuthSession();
  const [queue, setQueue] = useState<HarvestRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HarvestRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchQueue = useCallback(async () => {
    if (!session) return;
    setIsLoading(true); setError(null);
    try {
      const data = await getForemanHarvests({ laborerName: filterName, harvestDate: filterDate });
      setQueue(data);
      setSelectedRecord((prev) => prev ? (data.find((r) => r.id === prev.id) || null) : null);
    } catch (err) { setError("Failed to fetch validation queue."); } finally { setIsLoading(false); }
  }, [session, filterName, filterDate]);

  useEffect(() => { if (session) fetchQueue(); }, [session, fetchQueue]);

  const handleFilterSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchQueue(); };

  const handleApprove = async () => {
    if (!selectedRecord || !session) return;
    setIsProcessing(true); setError(null);
    try {
      await approveHarvest(selectedRecord.id); await fetchQueue();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to approve harvest."); } finally { setIsProcessing(false); }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !session || !rejectReason.trim()) return;
    setIsProcessing(true); setError(null);
    try {
      await rejectHarvest(selectedRecord.id, rejectReason);
      setIsRejectModalOpen(false); setRejectReason(""); await fetchQueue();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to reject harvest."); } finally { setIsProcessing(false); }
  };

  const getStatusBadgeStyles = (status: string) => {
    if (status === "APPROVED") return "bg-[#DAF1E3] text-[#2F7D4C]";
    if (status === "REJECTED") return "bg-[#FFDAD6] text-[#BA1A1A]";
    return "bg-[#F3E7D2] text-[#774E15]";
  };

  if (isAuthLoading) {
    return (
      <div className="flex gap-[24px]">
        <div className="flex-1 h-[400px] animate-pulse rounded-[16px] bg-[#F0F0E8]" />
        <div className="w-[400px] h-[400px] animate-pulse rounded-[16px] bg-[#F0F0E8] hidden lg:block" />
      </div>
    );
  }

  return (
    <div className={`relative ${jakarta.className}`}>
      <div className="flex flex-col lg:flex-row gap-[24px] items-start">
        <section className="flex-1 w-full space-y-[24px]">
          <div className="bg-[#FFFFFF] border border-[#E8E8DF] rounded-[16px] p-[24px] shadow-[0_2px_8px_rgba(26,28,24,0.05)]">
            <h2 className={`text-[28px] font-bold leading-[1.15] tracking-[-0.7px] text-[#1A1C18] ${syne.className}`}>
              Validation Queue
            </h2>
            <p className="mt-[4px] text-[16px] text-[#3D4038]">
              Review and validate pending harvests submitted by laborers.
            </p>

            <form onSubmit={handleFilterSubmit} className="mt-[24px] flex flex-col sm:flex-row gap-[16px] items-end bg-[#FFFFF1] p-[16px] rounded-[12px] border border-[#E8E8DF]">
              <div className="flex-1 w-full space-y-[6px]">
                <label className="text-[12px] font-bold text-[#3D4038] uppercase tracking-[0.08em]">Laborer Name</label>
                <Input
                  type="text" placeholder="Search name..." value={filterName} onChange={(e) => setFilterName(e.target.value)}
                  className={`h-[44px] px-[14px] bg-[#FFFFFF] border-[#DADAD3] rounded-[8px] text-[16px] text-[#1A1C18] focus-visible:border-[#2F7D4C] focus-visible:ring-[3px] focus-visible:ring-[#80B048]/28 ${jakarta.className}`}
                />
              </div>
              <div className="flex-1 w-full space-y-[6px]">
                <label className="text-[12px] font-bold text-[#3D4038] uppercase tracking-[0.08em]">Date</label>
                <Input
                  type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                  className={`h-[44px] px-[14px] bg-[#FFFFFF] border-[#DADAD3] rounded-[8px] text-[16px] text-[#1A1C18] focus-visible:border-[#2F7D4C] focus-visible:ring-[3px] focus-visible:ring-[#80B048]/28 ${jakarta.className}`}
                />
              </div>
              <Button type="submit" className={`w-full sm:w-auto bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] rounded-[8px] font-bold text-[14px] shadow-[0_1px_2px_rgba(26,28,24,0.08)] min-h-[44px] ${jakarta.className}`}>
                Filter
              </Button>
            </form>
          </div>

          {error && (
            <div className="rounded-[8px] border border-[#BA1A1A]/20 bg-[#FFDAD6] px-[16px] py-[12px] text-[14px] font-medium text-[#BA1A1A]">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-[16px]">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="h-[96px] animate-pulse rounded-[16px] bg-[#F0F0E8]" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#DADAD3] p-[48px] text-center bg-[#FFFFF1]/40 flex flex-col items-center justify-center">
              <LeafIcon />
              <p className="text-[16px] font-medium text-[#5F6358]">No pending harvest validations.</p>
            </div>
          ) : (
            <div className="space-y-[16px]">
              {queue.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`cursor-pointer rounded-[16px] p-[20px] border transition-all duration-160 flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] ${
                    selectedRecord?.id === record.id 
                      ? "bg-[#F3F8EC] border-[#415B2B] shadow-[0_2px_8px_rgba(26,28,24,0.05)]" 
                      : "bg-[#FFFFFF] border-[#E8E8DF] hover:shadow-[0_8px_24px_rgba(26,28,24,0.08)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-[12px] mb-[4px]">
                      <p className="text-[16px] font-bold text-[#1A1C18]">{record.laborerName}</p>
                      <span className={`px-[10px] py-[2px] rounded-[9999px] text-[11px] font-mono font-bold tracking-[0.06em] uppercase ${getStatusBadgeStyles(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#5F6358] font-mono tracking-wide">{record.harvestDate}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={`text-[32px] font-bold leading-none tracking-[-0.8px] text-[#415B2B] ${syne.className}`}>
                      {record.weightKg} <span className={`text-[16px] font-semibold text-[#5F6358] ${jakarta.className}`}>kg</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-[24px]">
          <div className="bg-[#FFFFFF] border border-[#E8E8DF] rounded-[16px] p-[24px] shadow-[0_2px_8px_rgba(26,28,24,0.05)] min-h-[400px] flex flex-col">
            <p className="text-[12px] font-mono font-bold tracking-[0.08em] text-[#5F6358] uppercase">Evidence Review</p>
            <h2 className={`mt-[8px] text-[22px] font-bold tracking-[-0.4px] text-[#1A1C18] border-b border-[#E8E8DF] pb-[16px] ${syne.className}`}>
              Record Details
            </h2>

            {!selectedRecord ? (
              <div className="flex-1 flex flex-col items-center justify-center mt-[16px] text-center">
                <p className="text-[16px] text-[#5F6358]">
                  Select a harvest record from the queue to review evidence and take action.
                </p>
              </div>
            ) : (
              <div className="mt-[24px] flex-1 flex flex-col">
                <div className="space-y-[20px] flex-1">
                  <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                      <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Laborer</p>
                      <p className="mt-[4px] text-[14px] font-bold text-[#1A1C18]">{selectedRecord.laborerName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Weight</p>
                      <p className="mt-[4px] text-[14px] font-bold text-[#415B2B]">{selectedRecord.weightKg} kg</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase">Notes</p>
                    <p className="mt-[4px] text-[14px] leading-[1.6] text-[#3D4038] bg-[#FFFFF1] border border-[#E8E8DF] p-[12px] rounded-[8px]">
                      {selectedRecord.notes}
                    </p>
                  </div>


                  <div>
  <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#5F6358] uppercase mb-[8px]">
    Photo Evidence
  </p>

  {selectedRecord.photoUrls && selectedRecord.photoUrls.length > 0 ? (
    <div className="grid grid-cols-2 gap-2">
      {selectedRecord.photoUrls.map((url, index) => (
        <div key={index} className="w-full aspect-video bg-[#F0F0E8] border border-[#E8E8DF] rounded-[8px] overflow-hidden flex items-center justify-center">
          <img
            src={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${url}`}
            alt={`Harvest Evidence ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  ) : (
    <div className="w-full aspect-video bg-[#F0F0E8] border border-[#E8E8DF] rounded-[8px] flex items-center justify-center">
      <span className="text-[12px] font-mono text-[#5F6358]">No Image</span>
    </div>
  )}
</div>

                  {selectedRecord.status === "REJECTED" && selectedRecord.rejectionReason && (
                    <div className="rounded-[8px] border border-[#BA1A1A]/20 bg-[#FFDAD6] p-[12px]">
                      <p className="text-[11px] font-mono font-bold tracking-[0.06em] text-[#BA1A1A] uppercase mb-[4px]">Rejection Reason</p>
                      <p className="text-[14px] font-medium text-[#BA1A1A]">{selectedRecord.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {selectedRecord.status === "PENDING" && (
                  <div className="mt-[32px] pt-[24px] border-t border-[#E8E8DF] flex gap-[12px]">
                    <Button 
                      variant="ghost" 
                      disabled={isProcessing}
                      onClick={() => setIsRejectModalOpen(true)}
                      className={`flex-1 bg-transparent border-[1.5px] border-[#BA1A1A] text-[#BA1A1A] hover:bg-[#FFDAD6] rounded-[8px] font-bold text-[14px] shadow-none min-h-[44px] ${jakarta.className}`}
                    >
                      Reject
                    </Button>
                    <Button 
                      disabled={isProcessing}
                      onClick={handleApprove}
                      className={`flex-1 bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] rounded-[8px] font-bold text-[14px] shadow-[0_1px_2px_rgba(26,28,24,0.08)] disabled:bg-[#F0F0E8] disabled:text-[#8A8D83] min-h-[44px] ${jakarta.className}`}
                    >
                      {isProcessing ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1C18]/40 backdrop-blur-sm p-[16px]">
          <div className="bg-[#FFFFFF] rounded-[24px] p-[24px] w-full max-w-md shadow-[0_24px_80px_rgba(26,28,24,0.18)] border border-[#E8E8DF]">
            <h3 className={`text-[22px] font-bold text-[#1A1C18] ${syne.className}`}>Reject Harvest</h3>
            <p className="mt-[8px] text-[16px] text-[#3D4038]">
              Please provide a clear reason for rejecting this harvest. The laborer will see this message.
            </p>
            <form onSubmit={handleReject} className="mt-[20px] space-y-[16px]">
              <Textarea
                placeholder="e.g., Photo is blurry, weight seems inaccurate."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className={`bg-[#FFFFF1] border-[#DADAD3] rounded-[8px] p-[14px] text-[16px] focus-visible:border-[#BA1A1A] focus-visible:ring-[3px] focus-visible:ring-[#BA1A1A]/20 min-h-[100px] resize-none ${jakarta.className}`}
                required
              />
              <div className="flex gap-[12px] pt-[8px]">
                <Button 
                  type="button" 
                  onClick={() => { setIsRejectModalOpen(false); setRejectReason(""); }} 
                  className={`flex-1 bg-transparent border border-[#DADAD3] text-[#3D4038] hover:bg-[#F0F0E8] rounded-[8px] shadow-none min-h-[44px] font-bold text-[14px] ${jakarta.className}`}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isProcessing || !rejectReason.trim()}
                  className={`flex-1 bg-[#BA1A1A] text-white hover:bg-[#901313] rounded-[8px] font-bold text-[14px] shadow-[0_1px_2px_rgba(26,28,24,0.08)] disabled:bg-[#F0F0E8] disabled:text-[#8A8D83] min-h-[44px] ${jakarta.className}`}
                >
                  {isProcessing ? "Processing..." : "Confirm Reject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}