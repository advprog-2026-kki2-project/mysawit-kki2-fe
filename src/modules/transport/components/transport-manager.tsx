"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Factory,
  Filter,
  MapPin,
  PackageCheck,
  RefreshCcw,
  Route,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiError } from "@/modules/auth/data/auth-api";
import type { AuthResponse } from "@/modules/auth/data/types";
import {
  createDriver,
  getDrivers,
  getPlantations,
} from "@/modules/plantation/data/plantation-api";
import type {
  Driver,
  Plantation,
} from "@/modules/plantation/data/types";
import {
  assignPickup,
  getAvailablePickups,
  getDriverDeliveries,
  getForemanApprovedDeliveries,
  getOngoingDeliveries,
  updateTransportStatus,
  verifyTransportByAdmin,
  verifyTransportByForeman,
} from "@/modules/transport/data/transport-api";
import {
  transportStatusLabels,
  type ApprovedHarvestPickup,
  type Transport,
  type TransportStatus,
} from "@/modules/transport/data/types";
import { getUsers } from "@/modules/users/data/users-api";

type TransportManagerProps = {
  session: AuthResponse;
};

type VerificationTarget =
  | { role: "FOREMAN"; mode: "REJECT"; transport: Transport }
  | { role: "ADMIN"; mode: "REJECT" | "PARTIAL"; transport: Transport }
  | null;

const driverStatuses = ["LOADING", "TRANSPORTING", "ARRIVED"] as const satisfies readonly TransportStatus[];

const statusClass: Record<TransportStatus, string> = {
  LOADING: "bg-[#ffe1c7] text-[#774e15]",
  TRANSPORTING: "bg-[#d7e3ff] text-[#005db8]",
  ARRIVED: "bg-[#efeee7] text-[#44483e]",
  FOREMAN_APPROVED: "bg-[#cdedae] text-[#2b4316]",
  FOREMAN_REJECTED: "bg-[#ffdad6] text-[#93000a]",
  ADMIN_APPROVED: "bg-[#cdedae] text-[#2b4316]",
  ADMIN_REJECTED: "bg-[#ffdad6] text-[#93000a]",
};

function formatKg(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "Belum tercatat";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function createdAtMatchesDate(transport: Transport, date: string) {
  if (!date) return true;
  return Boolean(transport.createdAt?.startsWith(date));
}

function TransportStatusBadge({ status }: { status: TransportStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase",
        statusClass[status],
      )}
    >
      {transportStatusLabels[status]}
    </span>
  );
}

export function TransportManager({ session }: TransportManagerProps) {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [availablePickups, setAvailablePickups] = useState<ApprovedHarvestPickup[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [selectedPlantationId, setSelectedPlantationId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedHarvestIds, setSelectedHarvestIds] = useState<string[]>([]);
  const [pickupSearch, setPickupSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [driverLookup, setDriverLookup] = useState(session.username);
  const [historyDate, setHistoryDate] = useState("");
  const [adminForemanSearch, setAdminForemanSearch] = useState("");
  const [adminDate, setAdminDate] = useState("");
  const [verificationTarget, setVerificationTarget] = useState<VerificationTarget>(null);
  const [verificationReason, setVerificationReason] = useState("");
  const [recognizedWeight, setRecognizedWeight] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const selectedPlantation = plantations.find(
    (plantation) => plantation.plantationId === selectedPlantationId,
  );
  const assignedDriverIds = selectedPlantation?.assignedDriverIds ?? [];
  const visibleDrivers = drivers.filter((driver) => {
    const matchesPlantation = assignedDriverIds.includes(driver.driverId);
    const matchesSearch =
      !driverSearch.trim() ||
      `${driver.driverName} ${driver.licenseNumber} ${driver.driverId}`
        .toLowerCase()
        .includes(driverSearch.toLowerCase());
    return matchesPlantation && matchesSearch;
  });
  const filteredPickups = availablePickups.filter((pickup) => {
    if (!pickupSearch.trim()) return true;
    return `${pickup.laborerName} ${pickup.harvestId}`.toLowerCase().includes(pickupSearch.toLowerCase());
  });
  const selectedPickups = availablePickups.filter((pickup) => selectedHarvestIds.includes(pickup.harvestId));
  const currentLoad = selectedPickups.reduce((total, pickup) => total + Number(pickup.weightKg), 0);
  const loadIsValid = currentLoad > 0 && currentLoad <= 400;
  const driverActiveTransport = transports.find((transport) =>
    ["LOADING", "TRANSPORTING", "ARRIVED"].includes(transport.status),
  );
  const driverHistory = transports.filter((transport) =>
    !["LOADING", "TRANSPORTING", "ARRIVED"].includes(transport.status) &&
    createdAtMatchesDate(transport, historyDate),
  );
  const adminItems = transports.filter((transport) => {
    const matchesForeman =
      !adminForemanSearch.trim() ||
      transport.foremanName.toLowerCase().includes(adminForemanSearch.toLowerCase());
    return matchesForeman && createdAtMatchesDate(transport, adminDate);
  });

  const adminStats = useMemo(() => {
    const totalWeight = adminItems.reduce((total, transport) => total + transport.totalWeight, 0);
    return {
      count: adminItems.length,
      totalWeight,
      averageRecognized:
        adminItems.length === 0
          ? 0
          : adminItems.reduce((total, transport) => total + (transport.recognizedWeight ?? transport.totalWeight), 0) /
            adminItems.length,
      partialCount: adminItems.filter((transport) => Boolean(transport.adminRejectionReason)).length,
    };
  }, [adminItems]);

  async function loadData(options?: { driverId?: string }) {
    setIsLoading(true);
    setError(null);

    try {
      if (session.role === "FOREMAN") {
        const [pickups, ongoing, plantationList, driverList, driverUsers] = await Promise.all([
          getAvailablePickups(),
          getOngoingDeliveries(),
          getPlantations(),
          getDrivers(),
          getUsers({ role: "DRIVER" }),
        ]);
        const driverIds = new Set(driverList.map((driver) => driver.driverId));
        const missingDriverUsers = driverUsers.filter((user) => !driverIds.has(user.username));
        const syncedDrivers = missingDriverUsers.length > 0
          ? await syncDriverUsers(missingDriverUsers)
          : [];

        setAvailablePickups(pickups);
        setTransports(ongoing);
        setPlantations(plantationList);
        setDrivers([...driverList, ...syncedDrivers]);
        setSelectedPlantationId((current) => current || plantationList[0]?.plantationId || "");
      } else if (session.role === "ADMIN") {
        setTransports(await getForemanApprovedDeliveries());
      } else if (session.role === "DRIVER") {
        const lookup = options?.driverId ?? driverLookup;
        if (lookup.trim()) {
          setTransports(await getDriverDeliveries(lookup.trim()));
        }
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Data pengiriman gagal dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function syncDriverUsers(driverUsers: Array<{ email: string; username: string }>) {
    const results = await Promise.all(
      driverUsers.map((user) =>
        createDriver({
          driverId: user.username,
          driverName: user.username,
          licenseNumber: user.email,
        }).catch(() => null),
      ),
    );

    return results.filter((driver): driver is Driver => driver !== null);
  }

  useEffect(() => {
    void loadData({ driverId: session.username });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.role, session.username]);

  function togglePickup(harvestId: string) {
    setSelectedHarvestIds((current) =>
      current.includes(harvestId)
        ? current.filter((id) => id !== harvestId)
        : [...current, harvestId],
    );
  }

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (!selectedDriverId || !loadIsValid) {
      setError("Pilih supir dan pastikan total muatan tidak melebihi 400 kg.");
      return;
    }

    setActionKey("assign");
    try {
      const result = await assignPickup({
        driverId: selectedDriverId,
        foremanName: session.username,
        harvestIds: selectedHarvestIds,
      });
      setFeedback(`Pengiriman #${result.id} berhasil dibuat untuk ${result.driverId}.`);
      setSelectedHarvestIds([]);
      setSelectedDriverId("");
      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Penugasan truk gagal.",
      );
    } finally {
      setActionKey(null);
    }
  }

  async function handleStatus(transport: Transport, status: TransportStatus) {
    setActionKey(`status-${transport.id}`);
    setError(null);
    setFeedback(null);

    try {
      await updateTransportStatus(transport.id, status);
      setFeedback(`Status pengiriman #${transport.id} diperbarui.`);
      await loadData({ driverId: driverLookup });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Status gagal diperbarui.");
    } finally {
      setActionKey(null);
    }
  }

  async function approveForeman(transport: Transport) {
    setActionKey(`foreman-approve-${transport.id}`);
    setError(null);
    setFeedback(null);

    try {
      await verifyTransportByForeman(transport.id, true);
      setFeedback(`Pengiriman #${transport.id} disetujui mandor.`);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Verifikasi mandor gagal.");
    } finally {
      setActionKey(null);
    }
  }

  async function approveAdmin(transport: Transport) {
    setActionKey(`admin-approve-${transport.id}`);
    setError(null);
    setFeedback(null);

    try {
      await verifyTransportByAdmin(transport.id, { approved: true });
      setFeedback(`Pengiriman #${transport.id} disetujui admin.`);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Verifikasi admin gagal.");
    } finally {
      setActionKey(null);
    }
  }

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verificationTarget) return;

    const reason = verificationReason.trim();
    if (!reason) {
      setError("Alasan wajib diisi.");
      return;
    }

    setActionKey(`verify-${verificationTarget.transport.id}`);
    setError(null);
    setFeedback(null);

    try {
      if (verificationTarget.role === "FOREMAN") {
        await verifyTransportByForeman(verificationTarget.transport.id, false, reason);
        setFeedback(`Pengiriman #${verificationTarget.transport.id} ditolak mandor.`);
      } else {
        const weight = recognizedWeight.trim() ? Number(recognizedWeight) : undefined;
        await verifyTransportByAdmin(verificationTarget.transport.id, {
          approved: false,
          recognizedWeight: verificationTarget.mode === "PARTIAL" ? weight : undefined,
          rejectionReason: reason,
        });
        setFeedback(
          verificationTarget.mode === "PARTIAL"
            ? `Pengiriman #${verificationTarget.transport.id} disetujui parsial.`
            : `Pengiriman #${verificationTarget.transport.id} ditolak admin.`,
        );
      }
      setVerificationTarget(null);
      setVerificationReason("");
      setRecognizedWeight("");
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Verifikasi gagal.");
    } finally {
      setActionKey(null);
    }
  }

  function renderFeedback() {
    return (
      <>
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
      </>
    );
  }

  function renderForemanView() {
    return (
      <form className="space-y-6" onSubmit={handleAssign}>
        {renderFeedback()}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mono-label text-[#74796d]">Pickup Valid</p>
                <h2 className="mt-1 font-[var(--font-syne)] text-2xl font-bold text-[#1a1c18]">
                  Tersedia untuk Diangkut
                </h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_13rem]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
                  <span className="sr-only">Cari panen</span>
                  <Input
                    value={pickupSearch}
                    onChange={(event) => setPickupSearch(event.target.value)}
                    placeholder="Cari pekerja atau ID"
                    className="pl-11"
                  />
                </label>
                <Select value={selectedPlantationId} onValueChange={setSelectedPlantationId}>
                  <SelectTrigger className="h-12 w-full px-4">
                    <SelectValue placeholder="Semua kebun" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantations.map((plantation) => (
                      <SelectItem key={plantation.plantationId} value={plantation.plantationId}>
                        {plantation.plantationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredPickups.map((pickup) => {
                const selected = selectedHarvestIds.includes(pickup.harvestId);
                return (
                  <button
                    key={pickup.harvestId}
                    type="button"
                    onClick={() => togglePickup(pickup.harvestId)}
                    className={cn(
                      "rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-[#3f6901]/50",
                      selected
                        ? "border-[#3f6901] ring-4 ring-[#3f6901]/10"
                        : "border-[rgba(116,121,109,0.22)]",
                    )}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-base font-bold text-[#1a1c18]">
                          <UserRound className="size-4 text-[#2b4316]" />
                          Harvester: {pickup.laborerName}
                        </span>
                        <span className="mt-3 grid grid-cols-2 gap-3 border-b border-dashed border-[#c4c8ba] pb-3">
                          <span>
                            <span className="mono-label block text-[#74796d]">ID Panen</span>
                            <span className="mt-1 block truncate font-bold text-[#1a1c18]">
                              {pickup.harvestId}
                            </span>
                          </span>
                          <span className="text-right">
                            <span className="mono-label block text-[#74796d]">Berat</span>
                            <span className="mt-1 block font-bold text-[#1a1c18]">
                              {formatKg(Number(pickup.weightKg))} kg
                            </span>
                          </span>
                        </span>
                        <span className="mt-3 flex items-center gap-1 text-sm text-[#44483e]">
                          <MapPin className="size-4 text-[#74796d]" />
                          {selectedPlantation?.plantationName ?? "Kebun belum dipilih"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "inline-flex size-5 shrink-0 items-center justify-center rounded border",
                          selected ? "border-[#3f6901] bg-[#3f6901] text-white" : "border-[#c4c8ba]",
                        )}
                      >
                        {selected ? <Check className="size-3" /> : null}
                      </span>
                    </span>
                  </button>
                );
              })}
              {filteredPickups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[rgba(116,121,109,0.28)] bg-white px-5 py-10 text-center md:col-span-2">
                  <PackageCheck className="mx-auto size-9 text-[#74796d]" />
                  <p className="mt-3 font-semibold text-[#1a1c18]">Belum ada panen siap angkut.</p>
                  <p className="mt-1 text-sm text-[#74796d]">
                    Hanya hasil panen yang sudah disetujui mandor yang muncul di sini.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white shadow-[0_18px_44px_rgba(119,78,21,0.10)]">
            <div className="rounded-t-lg bg-[#082818] px-4 py-4 text-white">
              <h2 className="flex items-center gap-2 font-[var(--font-syne)] text-xl font-bold">
                <Truck className="size-5" />
                Penugasan Truk
              </h2>
            </div>
            <div className="space-y-5 p-4">
              <div className="rounded-lg bg-[#f4f4ed] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="mono-label text-[#74796d]">Kapasitas Muatan</p>
                  <p className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                    {formatKg(currentLoad)} / 400 kg
                  </p>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#d8d9cf]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      currentLoad > 400 ? "bg-[#ba1a1a]" : "bg-[#3f6901]",
                    )}
                    style={{ width: `${Math.min((currentLoad / 400) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs text-[#44483e]">
                  <AlertCircle className="size-4" />
                  Maksimum kapasitas satu truk adalah 400 kg.
                </p>
              </div>

              <div>
                <p className="mono-label text-[#1a1c18]">Pilih Supir Truk</p>
                <label className="relative mt-3 block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
                  <span className="sr-only">Cari supir</span>
                  <Input
                    value={driverSearch}
                    onChange={(event) => setDriverSearch(event.target.value)}
                    placeholder="Cari supir"
                    className="pl-11"
                  />
                </label>
                <div className="mt-3 space-y-2">
                  {visibleDrivers.map((driver) => (
                    <button
                      key={driver.driverId}
                      type="button"
                      onClick={() => setSelectedDriverId(driver.driverId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-[#fafaf4]",
                        selectedDriverId === driver.driverId
                          ? "border-[#3f6901] ring-4 ring-[#3f6901]/10"
                          : "border-[rgba(116,121,109,0.2)]",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
                          selectedDriverId === driver.driverId
                            ? "border-[#3f6901] bg-[#3f6901] text-white"
                            : "border-[#74796d]",
                        )}
                      >
                        {selectedDriverId === driver.driverId ? <Check className="size-3" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-[#1a1c18]">
                          {driver.driverName}
                        </span>
                        <span className="block truncate text-sm text-[#44483e]">
                          {driver.licenseNumber}
                        </span>
                      </span>
                    </button>
                  ))}
                  {visibleDrivers.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[#c4c8ba] px-3 py-4 text-center text-sm text-[#74796d]">
                      Tidak ada supir pada kebun ini.
                    </p>
                  ) : null}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!selectedDriverId || !loadIsValid || actionKey === "assign"}
                className="w-full"
              >
                <Truck className="size-4" />
                Dispatch Truk
              </Button>
            </div>
          </aside>
        </div>

        <section className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white shadow-[0_14px_34px_rgba(119,78,21,0.08)]">
          <div className="flex flex-col gap-3 border-b border-[rgba(116,121,109,0.16)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 font-[var(--font-syne)] text-2xl font-bold text-[#1a1c18]">
              <ClipboardList className="size-5 text-[#2b4316]" />
              Pengiriman Aktif
            </h2>
            <Button type="button" variant="secondary" onClick={() => void loadData()} disabled={isLoading}>
              <RefreshCcw className="size-4" />
              Muat Ulang
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="bg-[#efeee7] text-xs font-bold uppercase text-[#44483e]">
                <tr>
                  <th className="px-4 py-3">ID Pengiriman</th>
                  <th className="px-4 py-3">Supir</th>
                  <th className="px-4 py-3 text-right">Muatan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(116,121,109,0.14)]">
                {transports.map((transport) => (
                  <tr key={transport.id}>
                    <td className="px-4 py-4 font-bold text-[#1a1c18]">#TRK-{transport.id}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#1a1c18]">{transport.driverId}</p>
                      <p className="text-xs text-[#74796d]">{transport.harvestIds.length} lot panen</p>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-[#1a1c18]">
                      {formatKg(transport.totalWeight)} kg
                    </td>
                    <td className="px-4 py-4">
                      <TransportStatusBadge status={transport.status} />
                    </td>
                    <td className="px-4 py-4">
                      {transport.status === "ARRIVED" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void approveForeman(transport)}
                            disabled={actionKey === `foreman-approve-${transport.id}`}
                          >
                            Terima
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setVerificationReason("");
                              setVerificationTarget({ role: "FOREMAN", mode: "REJECT", transport });
                            }}
                            className="border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/45"
                          >
                            Tolak
                          </Button>
                        </div>
                      ) : (
                        <p className="text-right text-sm text-[#74796d]">Menunggu tiba di tujuan</p>
                      )}
                    </td>
                  </tr>
                ))}
                {transports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#74796d]">
                      Belum ada pengiriman aktif.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </form>
    );
  }

  function renderDriverView() {
    return (
      <section className="space-y-5">
        {renderFeedback()}
        <form
          className="grid gap-3 rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            void loadData({ driverId: driverLookup });
          }}
        >
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
            <span className="sr-only">Cari pengiriman</span>
            <Input
              value={driverLookup}
              onChange={(event) => setDriverLookup(event.target.value)}
              placeholder="Masukkan Driver ID"
              className="pl-11"
              required
            />
          </label>
          <Button type="submit" disabled={isLoading}>
            <RefreshCcw className="size-4" />
            Muat Tugas
          </Button>
        </form>

        {driverActiveTransport ? (
          <article className="overflow-hidden rounded-lg bg-[#082818] p-5 text-white shadow-[0_18px_44px_rgba(8,40,24,0.20)]">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
              <div>
                <Badge className="bg-[#ffe1c7] text-[#774e15]">Aktif Sekarang</Badge>
                <h2 className="mt-3 font-[var(--font-syne)] text-3xl font-bold">
                  Pengiriman #TX-{driverActiveTransport.id}
                </h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase text-white/65">Lot Panen</p>
                    <p className="mt-2 font-bold">{driverActiveTransport.harvestIds.join(", ") || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase text-white/65">Total Berat</p>
                    <p className="mt-2 font-bold">{formatKg(driverActiveTransport.totalWeight)} kg</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase text-white/65">Tujuan</p>
                    <p className="mt-2 font-bold">Pabrik Utama</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/70">Update Status Pengiriman</p>
                <div className="mt-4 grid grid-cols-3 rounded-lg bg-black/20 p-2">
                  {driverStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void handleStatus(driverActiveTransport, status)}
                      disabled={actionKey === `status-${driverActiveTransport.id}`}
                      className={cn(
                        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition",
                        driverActiveTransport.status === status
                          ? "bg-white text-[#082818]"
                          : "text-white hover:bg-white/10",
                      )}
                    >
                      {status === "LOADING" ? <PackageCheck className="size-4" /> : null}
                      {status === "TRANSPORTING" ? <Truck className="size-4" /> : null}
                      {status === "ARRIVED" ? <MapPin className="size-4" /> : null}
                      {transportStatusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="rounded-lg border border-dashed border-[rgba(116,121,109,0.28)] bg-white px-5 py-10 text-center">
            <Truck className="mx-auto size-9 text-[#74796d]" />
            <p className="mt-3 font-semibold text-[#1a1c18]">Tidak ada tugas aktif.</p>
            <p className="mt-1 text-sm text-[#74796d]">Tugas aktif akan muncul setelah mandor melakukan dispatch.</p>
          </div>
        )}

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-[var(--font-syne)] text-2xl font-bold text-[#1a1c18]">
              Riwayat Pengiriman
            </h2>
            <DatePicker value={historyDate} onChange={setHistoryDate} placeholder="Filter tanggal" />
          </div>
          {driverHistory.map((transport) => (
            <article
              key={transport.id}
              className={cn(
                "rounded-lg border bg-white p-4 shadow-sm",
                transport.status.includes("REJECTED") ? "border-[#ffb4ab]" : "border-[rgba(116,121,109,0.2)]",
              )}
            >
              <div className="grid gap-3 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:items-center">
                <span
                  className={cn(
                    "inline-flex size-12 items-center justify-center rounded-lg",
                    transport.status.includes("REJECTED")
                      ? "bg-[#ffdad6] text-[#93000a]"
                      : "bg-[#cdedae] text-[#2b4316]",
                  )}
                >
                  {transport.status.includes("REJECTED") ? <XCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
                </span>
                <div>
                  <p className="font-bold text-[#1a1c18]">TX-{transport.id} - Pabrik Utama</p>
                  <p className="mt-1 text-sm text-[#44483e]">
                    {formatDateTime(transport.createdAt)} - {formatKg(transport.totalWeight)} kg
                  </p>
                  {transport.foremanRejectionReason || transport.adminRejectionReason ? (
                    <p className="mt-3 rounded-lg bg-[#fff0ee] px-3 py-2 text-sm text-[#93000a]">
                      Alasan: {transport.foremanRejectionReason ?? transport.adminRejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="sm:text-right">
                  <TransportStatusBadge status={transport.status} />
                  <p className="mt-2 font-bold text-[#1a1c18]">
                    {transport.status.includes("REJECTED") ? formatCurrency(0) : formatCurrency(transport.totalWeight * 450)}
                  </p>
                </div>
              </div>
            </article>
          ))}
          {driverHistory.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[rgba(116,121,109,0.28)] bg-white px-5 py-8 text-center text-sm text-[#74796d]">
              Riwayat belum tersedia untuk filter ini.
            </div>
          ) : null}
        </section>
      </section>
    );
  }

  function renderAdminView() {
    return (
      <section className="space-y-5">
        {renderFeedback()}
        <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_auto_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
              <span className="sr-only">Cari mandor</span>
              <Input
                value={adminForemanSearch}
                onChange={(event) => setAdminForemanSearch(event.target.value)}
                placeholder="Search by Mandor Name"
                className="pl-11"
              />
            </label>
            <DatePicker value={adminDate} onChange={setAdminDate} placeholder="Tanggal" />
            <Button type="button" variant="secondary" onClick={() => void loadData()} disabled={isLoading}>
              <Filter className="size-4" />
              Terapkan
            </Button>
            <Button type="button" variant="ghost">
              Export Excel
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-4">
            <p className="mono-label text-[#74796d]">Menunggu Audit</p>
            <p className="mt-2 font-[var(--font-syne)] text-3xl font-bold text-[#1a1c18]">
              {adminStats.count}
            </p>
          </div>
          <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-4">
            <p className="mono-label text-[#74796d]">Total Berat Pending</p>
            <p className="mt-2 font-[var(--font-syne)] text-3xl font-bold text-[#1a1c18]">
              {formatKg(adminStats.totalWeight)} kg
            </p>
          </div>
          <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white p-4">
            <p className="mono-label text-[#74796d]">Rata-rata Diakui</p>
            <p className="mt-2 font-[var(--font-syne)] text-3xl font-bold text-[#2b4316]">
              {formatKg(adminStats.averageRecognized)} kg
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-[#a14d24] bg-white p-4 shadow-sm">
            <p className="mono-label text-[#74796d]">Ditolak Parsial</p>
            <p className="mt-2 font-[var(--font-syne)] text-3xl font-bold text-[#a14d24]">
              {adminStats.partialCount}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-lg border border-[rgba(116,121,109,0.22)] bg-white shadow-[0_14px_34px_rgba(119,78,21,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] text-left text-sm">
              <thead className="bg-[#efeee7] text-xs font-bold uppercase text-[#44483e]">
                <tr>
                  <th className="px-4 py-3">Mandor</th>
                  <th className="px-4 py-3">Driver / Armada</th>
                  <th className="px-4 py-3 text-right">Total Berat</th>
                  <th className="px-4 py-3">Tanggal & Waktu</th>
                  <th className="px-4 py-3">Status Mandor</th>
                  <th className="px-4 py-3 text-right">Aksi Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(116,121,109,0.14)]">
                {adminItems.map((transport) => (
                  <tr key={transport.id}>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#1a1c18]">{transport.foremanName}</p>
                      <p className="text-xs text-[#74796d]">Pengiriman #{transport.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#1a1c18]">{transport.driverId}</p>
                      <p className="text-xs text-[#74796d]">{transport.harvestIds.length} lot panen</p>
                    </td>
                    <td className="px-4 py-4 text-right font-[var(--font-syne)] text-xl font-bold text-[#082818]">
                      {formatKg(transport.totalWeight)} kg
                    </td>
                    <td className="px-4 py-4 text-[#44483e]">{formatDateTime(transport.createdAt)}</td>
                    <td className="px-4 py-4">
                      <TransportStatusBadge status={transport.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Setujui"
                          onClick={() => void approveAdmin(transport)}
                          disabled={actionKey === `admin-approve-${transport.id}`}
                        >
                          <CheckCircle2 className="size-5 text-[#2b4316]" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Tolak parsial"
                          onClick={() => {
                            setVerificationReason("");
                            setRecognizedWeight(String(transport.totalWeight));
                            setVerificationTarget({ role: "ADMIN", mode: "PARTIAL", transport });
                          }}
                        >
                          <ShieldCheck className="size-5 text-[#a14d24]" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Tolak"
                          onClick={() => {
                            setVerificationReason("");
                            setRecognizedWeight("");
                            setVerificationTarget({ role: "ADMIN", mode: "REJECT", transport });
                          }}
                        >
                          <XCircle className="size-5 text-[#ba1a1a]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {adminItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[#74796d]">
                      Tidak ada pengiriman yang menunggu audit admin.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {session.role === "FOREMAN" ? renderForemanView() : null}
      {session.role === "DRIVER" ? renderDriverView() : null}
      {session.role === "ADMIN" ? renderAdminView() : null}

      <Dialog
        open={Boolean(verificationTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setVerificationTarget(null);
            setVerificationReason("");
            setRecognizedWeight("");
          }
        }}
      >
        <DialogContent className="bg-white sm:max-w-lg">
          <form onSubmit={submitVerification}>
            <DialogHeader>
              <DialogTitle>
                {verificationTarget?.role === "ADMIN" && verificationTarget.mode === "PARTIAL"
                  ? "Tolak Parsial Pengiriman"
                  : "Tolak Pengiriman"}
              </DialogTitle>
              <DialogDescription>
                Alasan akan tampil di riwayat pengiriman supir.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-3 rounded-lg bg-[#f4f4ed] p-4 text-sm text-[#44483e]">
              <div className="flex items-center justify-between gap-3">
                <span>ID Pengiriman</span>
                <span className="font-bold text-[#1a1c18]">#TX-{verificationTarget?.transport.id}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Total Muatan</span>
                <span className="font-bold text-[#1a1c18]">
                  {verificationTarget ? formatKg(verificationTarget.transport.totalWeight) : 0} kg
                </span>
              </div>
            </div>

            {verificationTarget?.role === "ADMIN" && verificationTarget.mode === "PARTIAL" ? (
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[#1a1c18]">Kg diakui</span>
                <Input
                  type="number"
                  min="0"
                  max={verificationTarget.transport.totalWeight}
                  value={recognizedWeight}
                  onChange={(event) => setRecognizedWeight(event.target.value)}
                  placeholder="Masukkan kg yang diakui"
                  className="mt-2"
                  required
                />
              </label>
            ) : null}

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-[#1a1c18]">Alasan</span>
              <Textarea
                value={verificationReason}
                onChange={(event) => setVerificationReason(event.target.value)}
                placeholder="Contoh: jumlah sawit tidak sesuai dengan dokumen pengiriman."
                className="mt-2 min-h-28"
                required
              />
            </label>

            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setVerificationTarget(null);
                  setVerificationReason("");
                  setRecognizedWeight("");
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="secondary"
                disabled={Boolean(verificationTarget && actionKey === `verify-${verificationTarget.transport.id}`)}
                className="border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/45"
              >
                <X className="size-4" />
                Simpan Verifikasi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-[rgba(116,121,109,0.18)] bg-white/70 p-4 text-sm text-[#44483e]">
        <div className="grid gap-3 sm:grid-cols-3">
          <span className="flex items-center gap-2">
            <Route className="size-4 text-[#2b4316]" />
            Status supir: Memuat, Mengirim, Tiba
          </span>
          <span className="flex items-center gap-2">
            <Factory className="size-4 text-[#2b4316]" />
            Tujuan default: Pabrik Utama
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[#2b4316]" />
            Kapasitas maksimum: 400 kg
          </span>
        </div>
      </div>
    </div>
  );
}
