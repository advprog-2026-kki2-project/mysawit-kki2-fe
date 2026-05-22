"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link2, RefreshCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/modules/auth/data/auth-api";
import {
  assignDriverToPlantation,
  assignForemanToPlantation,
  createDriver,
  createForeman,
  getDrivers,
  getForemen,
  getPlantations,
  unassignDriverFromPlantation,
  unassignForemanFromPlantation,
} from "@/modules/plantation/data/plantation-api";
import type { Driver, Foreman, Plantation } from "@/modules/plantation/data/types";

export function PlantationAssignmentPanel() {
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedPlantation, setSelectedPlantation] = useState("");
  const [selectedForeman, setSelectedForeman] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [foremanName, setForemanName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [driverName, setDriverName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plantation = useMemo(
    () => plantations.find((item) => item.plantationId === selectedPlantation),
    [plantations, selectedPlantation],
  );

  async function loadData() {
    setError(null);
    try {
      const [plantationResult, foremanResult, driverResult] = await Promise.all([
        getPlantations(),
        getForemen(),
        getDrivers(),
      ]);
      setPlantations(plantationResult);
      setForemen(foremanResult);
      setDrivers(driverResult);
      setSelectedPlantation((current) => current || plantationResult[0]?.plantationId || "");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Data assignment tidak dapat dimuat.",
      );
    }
  }

  useEffect(() => {
    let isMounted = true;

    Promise.all([getPlantations(), getForemen(), getDrivers()])
      .then(([plantationResult, foremanResult, driverResult]) => {
        if (!isMounted) {
          return;
        }

        setPlantations(plantationResult);
        setForemen(foremanResult);
        setDrivers(driverResult);
        setSelectedPlantation(plantationResult[0]?.plantationId || "");
      })
      .catch((caughtError) => {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof ApiError || caughtError instanceof Error
            ? caughtError.message
            : "Data assignment tidak dapat dimuat.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateForeman(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await createForeman({ foremanName, employeeCode });
      setFeedback(`Mandor ${result.foremanName} berhasil dibuat.`);
      setForemanName("");
      setEmployeeCode("");
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Mandor gagal dibuat.");
    }
  }

  async function handleCreateDriver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await createDriver({ driverName, licenseNumber });
      setFeedback(`Supir ${result.driverName} berhasil dibuat.`);
      setDriverName("");
      setLicenseNumber("");
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Supir gagal dibuat.");
    }
  }

  async function handleAssignForeman() {
    if (!selectedForeman || !selectedPlantation) return;
    await assignForemanToPlantation(selectedForeman, selectedPlantation);
    setFeedback("Mandor berhasil ditugaskan ke plantation.");
    await loadData();
  }

  async function handleAssignDriver() {
    if (!selectedDriver || !selectedPlantation) return;
    await assignDriverToPlantation(selectedDriver, selectedPlantation);
    setFeedback("Supir berhasil ditugaskan ke plantation.");
    await loadData();
  }

  return (
    <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mono-label text-[#74796d]">Assignment</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#1a1c18]">
            Mandor dan supir plantation.
          </h2>
        </div>
        <Button type="button" variant="secondary" onClick={() => void loadData()}>
          <RefreshCcw className="size-4" />
          Muat ulang
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form className="space-y-3 rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed] p-4" onSubmit={handleCreateForeman}>
          <h3 className="font-semibold text-[#1a1c18]">Tambah mandor</h3>
          <Input value={foremanName} onChange={(event) => setForemanName(event.target.value)} placeholder="Nama mandor" required />
          <Input value={employeeCode} onChange={(event) => setEmployeeCode(event.target.value)} placeholder="Kode pegawai" required />
          <Button type="submit" className="w-full">Tambah mandor</Button>
        </form>
        <form className="space-y-3 rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed] p-4" onSubmit={handleCreateDriver}>
          <h3 className="font-semibold text-[#1a1c18]">Tambah supir</h3>
          <Input value={driverName} onChange={(event) => setDriverName(event.target.value)} placeholder="Nama supir" required />
          <Input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} placeholder="Nomor lisensi" required />
          <Button type="submit" className="w-full">Tambah supir</Button>
        </form>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
        <Select value={selectedPlantation} onValueChange={setSelectedPlantation}>
          <SelectTrigger className="h-12 w-full px-5"><SelectValue placeholder="Pilih plantation" /></SelectTrigger>
          <SelectContent>
            {plantations.map((item) => (
              <SelectItem key={item.plantationId} value={item.plantationId}>{item.plantationName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedForeman} onValueChange={setSelectedForeman}>
          <SelectTrigger className="h-12 w-full px-5"><SelectValue placeholder="Pilih mandor" /></SelectTrigger>
          <SelectContent>
            {foremen.map((item) => (
              <SelectItem key={item.foremanId} value={item.foremanId}>{item.foremanName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={() => void handleAssignForeman()}>
          <Link2 className="size-4" />
          Assign mandor
        </Button>
        <div />
        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
          <SelectTrigger className="h-12 w-full px-5"><SelectValue placeholder="Pilih supir" /></SelectTrigger>
          <SelectContent>
            {drivers.map((item) => (
              <SelectItem key={item.driverId} value={item.driverId}>{item.driverName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={() => void handleAssignDriver()}>
          <Link2 className="size-4" />
          Assign supir
        </Button>
      </div>

      {plantation ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[rgba(116,121,109,0.24)] p-4">
            <h3 className="font-semibold text-[#1a1c18]">Mandor aktif</h3>
            <div className="mt-3 space-y-2">
              {plantation.assignedForemanIds.map((foremanId) => (
                <div key={foremanId} className="flex items-center justify-between rounded-full bg-[#f4f4ed] px-4 py-2 text-sm">
                  <span>{foremen.find((item) => item.foremanId === foremanId)?.foremanName ?? foremanId}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => void unassignForemanFromPlantation(foremanId, plantation.plantationId).then(loadData)}>
                    <Trash2 className="size-4" />
                    Copot
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[rgba(116,121,109,0.24)] p-4">
            <h3 className="font-semibold text-[#1a1c18]">Supir aktif</h3>
            <div className="mt-3 space-y-2">
              {plantation.assignedDriverIds.map((driverId) => (
                <div key={driverId} className="flex items-center justify-between rounded-full bg-[#f4f4ed] px-4 py-2 text-sm">
                  <span>{drivers.find((item) => item.driverId === driverId)?.driverName ?? driverId}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => void unassignDriverFromPlantation(driverId, plantation.plantationId).then(loadData)}>
                    <Trash2 className="size-4" />
                    Copot
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {feedback ? <p className="mt-4 rounded-lg bg-[#cdedae] px-4 py-3 text-sm">{feedback}</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">{error}</p> : null}
    </section>
  );
}
