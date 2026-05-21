"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, RefreshCcw, Truck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/modules/auth/data/auth-api";
import type { AuthResponse } from "@/modules/auth/data/types";
import {
  assignPickup,
  getDriverDeliveries,
  getForemanApprovedDeliveries,
  getOngoingDeliveries,
  updateTransportStatus,
  verifyTransportByAdmin,
  verifyTransportByForeman,
} from "@/modules/transport/data/transport-api";
import {
  transportStatusLabels,
  type Transport,
  type TransportStatus,
} from "@/modules/transport/data/types";

type TransportManagerProps = {
  session: AuthResponse;
};

export function TransportManager({ session }: TransportManagerProps) {
  const [items, setItems] = useState<Transport[]>([]);
  const [driverId, setDriverId] = useState("");
  const [foremanName, setForemanName] = useState(session.username);
  const [harvestIds, setHarvestIds] = useState("");
  const [driverLookup, setDriverLookup] = useState("");
  const [reason, setReason] = useState<Record<number, string>>({});
  const [recognizedWeight, setRecognizedWeight] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      if (session.role === "FOREMAN") {
        setItems(await getOngoingDeliveries());
      } else if (session.role === "ADMIN") {
        setItems(await getForemanApprovedDeliveries());
      } else if (session.role === "DRIVER" && driverLookup.trim()) {
        setItems(await getDriverDeliveries(driverLookup.trim()));
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Data transport gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (session.role !== "DRIVER") {
      void loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.role]);

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const result = await assignPickup({
        driverId,
        foremanName,
        harvestIds: harvestIds.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setFeedback(`Pickup #${result.id} berhasil dibuat.`);
      setDriverId("");
      setHarvestIds("");
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError || caughtError instanceof Error ? caughtError.message : "Pickup gagal dibuat.");
    }
  }

  async function handleStatus(transport: Transport, status: TransportStatus) {
    await updateTransportStatus(transport.id, status);
    setFeedback(`Status transport #${transport.id} diperbarui.`);
    await loadData();
  }

  async function handleForemanVerify(transport: Transport, approved: boolean) {
    try {
      await verifyTransportByForeman(transport.id, approved, reason[transport.id]);
      setFeedback(`Verifikasi mandor untuk #${transport.id} berhasil.`);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Verifikasi gagal.");
    }
  }

  async function handleAdminVerify(transport: Transport, approved: boolean) {
    try {
      const weight = recognizedWeight[transport.id]?.trim();
      await verifyTransportByAdmin(transport.id, {
        approved,
        recognizedWeight: weight ? Number(weight) : undefined,
        rejectionReason: reason[transport.id],
      });
      setFeedback(`Verifikasi admin untuk #${transport.id} berhasil.`);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Verifikasi admin gagal.");
    }
  }

  return (
    <div className="space-y-6">
      {session.role === "FOREMAN" ? (
        <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <p className="mono-label text-[#74796d]">Assign Pickup</p>
          <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleAssign}>
            <Input value={driverId} onChange={(event) => setDriverId(event.target.value)} placeholder="Driver ID" required />
            <Input value={foremanName} onChange={(event) => setForemanName(event.target.value)} placeholder="Nama mandor" required />
            <Input value={harvestIds} onChange={(event) => setHarvestIds(event.target.value)} placeholder="Harvest ID, pisahkan koma" required />
            <Button type="submit">
              <Truck className="size-4" />
              Assign
            </Button>
          </form>
        </section>
      ) : null}

      {session.role === "DRIVER" ? (
        <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={(event) => { event.preventDefault(); void loadData(); }}>
            <Input value={driverLookup} onChange={(event) => setDriverLookup(event.target.value)} placeholder="Masukkan Driver ID" required />
            <Button type="submit">
              <RefreshCcw className="size-4" />
              Muat delivery
            </Button>
          </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono-label text-[#74796d]">Transport</p>
            <h2 className="mt-3 text-2xl font-semibold text-[#1a1c18]">
              {session.role === "ADMIN" ? "Delivery menunggu verifikasi admin." : "Daftar pengiriman."}
            </h2>
          </div>
          <Button type="button" variant="secondary" onClick={() => void loadData()} disabled={isLoading}>
            <RefreshCcw className="size-4" />
            Muat ulang
          </Button>
        </div>

        {feedback ? <p className="mt-4 rounded-lg bg-[#cdedae] px-4 py-3 text-sm">{feedback}</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">{error}</p> : null}

        <div className="mt-6 grid gap-4">
          {items.map((transport) => (
            <article key={transport.id} className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed] p-4">
              <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
                <div>
                  <p className="text-sm font-semibold text-[#1a1c18]">
                    #{transport.id} · {transport.driverId} · {transport.totalWeight} kg
                  </p>
                  <p className="mt-2 text-sm text-[#44483e]">
                    Mandor {transport.foremanName} · {transportStatusLabels[transport.status]}
                  </p>
                  {transport.foremanRejectionReason || transport.adminRejectionReason ? (
                    <p className="mt-2 text-sm text-[#93000a]">
                      {transport.foremanRejectionReason ?? transport.adminRejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-3">
                  {session.role === "DRIVER" ? (
                    <Select
                      value={transport.status}
                      onValueChange={(value) => void handleStatus(transport, value as TransportStatus)}
                    >
                      <SelectTrigger className="h-11 w-full px-4"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["LOADING", "TRANSPORTING", "ARRIVED"] as TransportStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>{transportStatusLabels[status]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {(session.role === "FOREMAN" || session.role === "ADMIN") ? (
                    <>
                      <Textarea
                        value={reason[transport.id] ?? ""}
                        onChange={(event) => setReason((current) => ({ ...current, [transport.id]: event.target.value }))}
                        placeholder="Alasan penolakan atau partial rejection"
                        className="min-h-20 rounded-[1rem]"
                      />
                      {session.role === "ADMIN" ? (
                        <Input
                          type="number"
                          value={recognizedWeight[transport.id] ?? ""}
                          onChange={(event) => setRecognizedWeight((current) => ({ ...current, [transport.id]: event.target.value }))}
                          placeholder="Kg diakui jika partial"
                        />
                      ) : null}
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={() => session.role === "ADMIN" ? void handleAdminVerify(transport, true) : void handleForemanVerify(transport, true)}>
                          <Check className="size-4" />
                          Approve
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => session.role === "ADMIN" ? void handleAdminVerify(transport, false) : void handleForemanVerify(transport, false)}>
                          <X className="size-4" />
                          Reject
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
