"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Edit3,
  Map,
  Plus,
  Search,
  Trash2,
  Truck,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import {
  assignDriverToPlantation,
  assignForemanToPlantation,
  createDriver,
  createForeman,
  createPlantation,
  deletePlantation,
  getDrivers,
  getForemen,
  getPlantations,
  updatePlantation,
} from "@/modules/plantation/data/plantation-api";
import type {
  Driver,
  Foreman,
  Plantation,
  PlantationCoordinate,
  PlantationPayload,
} from "@/modules/plantation/data/types";
import { getUsers } from "@/modules/users/data/users-api";

type PlantationFormState = {
  plantationCode: string;
  plantationName: string;
  areaHectares: string;
  corners: Array<{ x: string; y: string }>;
};

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const emptyFormState: PlantationFormState = {
  plantationCode: "",
  plantationName: "",
  areaHectares: "",
  corners: [
    { x: "0", y: "0" },
    { x: "10", y: "0" },
    { x: "10", y: "10" },
    { x: "0", y: "10" },
  ],
};

function readError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError || caughtError instanceof Error
    ? caughtError.message
    : fallback;
}

function toFormState(plantation: Plantation): PlantationFormState {
  return {
    plantationCode: plantation.plantationCode,
    plantationName: plantation.plantationName,
    areaHectares: String(plantation.areaHectares),
    corners: Array.from({ length: 4 }, (_, index) => ({
      x: plantation.corners[index] ? String(plantation.corners[index].x) : "",
      y: plantation.corners[index] ? String(plantation.corners[index].y) : "",
    })),
  };
}

function toPayload(formState: PlantationFormState): PlantationPayload {
  return {
    plantationCode: formState.plantationCode.trim(),
    plantationName: formState.plantationName.trim(),
    areaHectares: Number(formState.areaHectares),
    corners: formState.corners.map((corner) => ({
      x: Number(corner.x),
      y: Number(corner.y),
    })),
  };
}

function boundsOf(corners: PlantationCoordinate[]): Bounds {
  return {
    minX: Math.min(...corners.map((corner) => corner.x)),
    minY: Math.min(...corners.map((corner) => corner.y)),
    maxX: Math.max(...corners.map((corner) => corner.x)),
    maxY: Math.max(...corners.map((corner) => corner.y)),
  };
}

function hasValidBounds(plantation: Pick<Plantation, "corners">) {
  return plantation.corners.length === 4 && plantation.corners.every((corner) => Number.isFinite(corner.x) && Number.isFinite(corner.y));
}

function overlaps(first: Bounds, second: Bounds) {
  return (
    first.minX < second.maxX &&
    first.maxX > second.minX &&
    first.minY < second.maxY &&
    first.maxY > second.minY
  );
}

function isSquare(corners: PlantationCoordinate[]) {
  if (corners.length !== 4) {
    return false;
  }

  const bounds = boundsOf(corners);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const cornerKeys = new Set(corners.map((corner) => `${corner.x}:${corner.y}`));

  return width > 0 && height > 0 && width === height && cornerKeys.size === 4;
}

function formatCorners(corners: PlantationCoordinate[]) {
  return corners.map((corner) => `(${corner.x}, ${corner.y})`).join("  ");
}

function findPlantationForForeman(plantations: Plantation[], foremanId: string) {
  return plantations.find((plantation) =>
    plantation.assignedForemanIds.includes(foremanId),
  );
}

function findPlantationForDriver(plantations: Plantation[], driverId: string) {
  return plantations.find((plantation) =>
    plantation.assignedDriverIds.includes(driverId),
  );
}

function getMapBounds(plantations: Plantation[]) {
  const validPlantations = plantations.filter(hasValidBounds);
  if (validPlantations.length === 0) {
    return { minX: -5, minY: -5, maxX: 25, maxY: 25 };
  }

  const bounds = validPlantations.map((plantation) => boundsOf(plantation.corners));
  const minX = Math.min(...bounds.map((item) => item.minX));
  const minY = Math.min(...bounds.map((item) => item.minY));
  const maxX = Math.max(...bounds.map((item) => item.maxX));
  const maxY = Math.max(...bounds.map((item) => item.maxY));
  const padding = Math.max(6, (maxX - minX + maxY - minY) / 16);

  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
  };
}

function PlantationMap({
  plantations,
  selectedPlantationId,
  onSelect,
}: {
  plantations: Plantation[];
  selectedPlantationId?: string;
  onSelect?: (plantationId: string) => void;
}) {
  const mapBounds = getMapBounds(plantations);
  const width = mapBounds.maxX - mapBounds.minX;
  const height = mapBounds.maxY - mapBounds.minY;

  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed]">
      <svg
        viewBox={`${mapBounds.minX} ${mapBounds.minY} ${width} ${height}`}
        className="aspect-[16/9] w-full"
        role="img"
        aria-label="Peta koordinat kebun"
      >
        <defs>
          <pattern id="plantation-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(116,121,109,0.22)" strokeWidth="0.35" />
          </pattern>
        </defs>
        <rect x={mapBounds.minX} y={mapBounds.minY} width={width} height={height} fill="url(#plantation-grid)" />
        {plantations.filter(hasValidBounds).map((plantation, index) => {
          const bounds = boundsOf(plantation.corners);
          const isSelected = plantation.plantationId === selectedPlantationId;
          const fill = isSelected ? "rgba(63,105,1,0.52)" : index % 2 === 0 ? "rgba(205,237,174,0.72)" : "rgba(255,218,198,0.72)";
          const stroke = isSelected ? "#2b4316" : "#74796d";

          return (
            <g key={plantation.plantationId}>
              <rect
                x={bounds.minX}
                y={bounds.minY}
                width={bounds.maxX - bounds.minX}
                height={bounds.maxY - bounds.minY}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 1.4 : 0.7}
                className={onSelect ? "cursor-pointer" : undefined}
                onClick={() => onSelect?.(plantation.plantationId)}
              />
              <text
                x={(bounds.minX + bounds.maxX) / 2}
                y={(bounds.minY + bounds.maxY) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(2.4, Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / 5)}
                fill="#1a1c18"
                fontWeight="700"
                pointerEvents="none"
              >
                {plantation.plantationCode}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PlantationManager() {
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedPlantationId, setSelectedPlantationId] = useState<string | null>(null);
  const [editingPlantation, setEditingPlantation] = useState<Plantation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<PlantationFormState>(emptyFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlantation = useMemo(
    () => plantations.find((plantation) => plantation.plantationId === selectedPlantationId) ?? null,
    [plantations, selectedPlantationId],
  );

  const visiblePlantations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return plantations.filter((plantation) => {
      if (!query) {
        return true;
      }

      return (
        plantation.plantationName.toLowerCase().includes(query) ||
        plantation.plantationCode.toLowerCase().includes(query)
      );
    });
  }, [plantations, search]);

  const assignedForeman = useMemo(() => {
    if (!selectedPlantation?.assignedForemanIds[0]) {
      return null;
    }

    return foremen.find((foreman) => foreman.foremanId === selectedPlantation.assignedForemanIds[0]) ?? null;
  }, [foremen, selectedPlantation]);

  const assignedDrivers = useMemo(() => {
    if (!selectedPlantation) {
      return [];
    }

    const query = driverSearch.trim().toLowerCase();
    return drivers.filter((driver) => {
      const isAssigned = selectedPlantation.assignedDriverIds.includes(driver.driverId);
      if (!isAssigned) {
        return false;
      }
      return !query || driver.driverName.toLowerCase().includes(query);
    });
  }, [drivers, driverSearch, selectedPlantation]);

  async function loadData(nextSelectedId = selectedPlantationId) {
    setIsLoading(true);
    setError(null);

    try {
      const [plantationResult, foremanResult, driverResult, driverUsers, foremanUsers] = await Promise.all([
        getPlantations(),
        getForemen(),
        getDrivers(),
        getUsers({ role: "DRIVER" }),
        getUsers({ role: "FOREMAN" }),
      ]);
      const driverIds = new Set(driverResult.map((driver) => driver.driverId));
      const missingDriverUsers = driverUsers.filter((user) => !driverIds.has(user.username));
      const syncedDrivers = missingDriverUsers.length > 0
        ? await syncDriverUsers(missingDriverUsers)
        : [];
      const foremanIds = new Set(foremanResult.map((foreman) => foreman.foremanId));
      const missingForemanUsers = foremanUsers.filter((user) => !foremanIds.has(user.username));
      const syncedForemen = missingForemanUsers.length > 0
        ? await syncForemanUsers(missingForemanUsers)
        : [];

      setPlantations(plantationResult);
      setForemen([...foremanResult, ...syncedForemen]);
      setDrivers([...driverResult, ...syncedDrivers]);
      setSelectedPlantationId(
        nextSelectedId && plantationResult.some((item) => item.plantationId === nextSelectedId)
          ? nextSelectedId
          : plantationResult[0]?.plantationId ?? null,
      );
    } catch (caughtError) {
      setError(readError(caughtError, "Data kebun tidak dapat dimuat."));
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

  async function syncForemanUsers(
    foremanUsers: Array<{
      email: string;
      username: string;
      foremanCertificationNumber: string | null;
    }>,
  ) {
    const results = await Promise.all(
      foremanUsers.map((user) =>
        createForeman({
          foremanId: user.username,
          foremanName: user.username,
          employeeCode: user.foremanCertificationNumber ?? user.email,
        }).catch(() => null),
      ),
    );

    return results.filter((foreman): foreman is Foreman => foreman !== null);
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreateDialog() {
    setEditingPlantation(null);
    setFormState(emptyFormState);
    setIsFormOpen(true);
    setError(null);
    setFeedback(null);
  }

  function openEditDialog(plantation: Plantation) {
    setEditingPlantation(plantation);
    setFormState(toFormState(plantation));
    setIsFormOpen(true);
    setError(null);
    setFeedback(null);
  }

  function formValidationMessage() {
    const payload = toPayload(formState);
    if (!isSquare(payload.corners)) {
      return "Koordinat harus membentuk persegi dari empat titik integer.";
    }

    const candidateBounds = boundsOf(payload.corners);
    const overlappingPlantation = plantations.find((plantation) => {
      if (editingPlantation?.plantationId === plantation.plantationId || !hasValidBounds(plantation)) {
        return false;
      }
      return overlaps(candidateBounds, boundsOf(plantation.corners));
    });

    return overlappingPlantation
      ? `Koordinat overlap dengan ${overlappingPlantation.plantationName}.`
      : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = formValidationMessage();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setActionKey("save-plantation");
    setError(null);
    setFeedback(null);

    try {
      const payload = toPayload(formState);
      const result = editingPlantation
        ? await updatePlantation(editingPlantation.plantationId, payload)
        : await createPlantation(payload);

      setFeedback(`${result.plantationName} berhasil disimpan.`);
      setIsFormOpen(false);
      setEditingPlantation(null);
      await loadData(result.plantationId);
    } catch (caughtError) {
      setError(readError(caughtError, "Kebun gagal disimpan."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleDelete(plantation: Plantation) {
    const confirmed = window.confirm(`Hapus ${plantation.plantationName}?`);
    if (!confirmed) {
      return;
    }

    setActionKey(`delete-${plantation.plantationId}`);
    setError(null);
    setFeedback(null);

    try {
      await deletePlantation(plantation.plantationId);
      setFeedback(`${plantation.plantationName} berhasil dihapus.`);
      await loadData(selectedPlantationId === plantation.plantationId ? undefined : selectedPlantationId);
    } catch (caughtError) {
      setError(readError(caughtError, "Kebun gagal dihapus."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleAssignForeman(foremanId: string) {
    if (!selectedPlantation) {
      return;
    }

    setActionKey(`foreman-${foremanId}`);
    setError(null);
    setFeedback(null);

    try {
      await assignForemanToPlantation(foremanId, selectedPlantation.plantationId);
      setFeedback("Mandor berhasil ditugaskan.");
      await loadData(selectedPlantation.plantationId);
    } catch (caughtError) {
      setError(readError(caughtError, "Mandor gagal ditugaskan."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleAssignDriver(driverId: string) {
    if (!selectedPlantation) {
      return;
    }

    setActionKey(`driver-${driverId}`);
    setError(null);
    setFeedback(null);

    try {
      await assignDriverToPlantation(driverId, selectedPlantation.plantationId);
      setFeedback("Supir berhasil ditugaskan.");
      await loadData(selectedPlantation.plantationId);
    } catch (caughtError) {
      setError(readError(caughtError, "Supir gagal ditugaskan."));
    } finally {
      setActionKey(null);
    }
  }

  function renderPlantationDialog() {
    const validationMessage = formValidationMessage();

    return (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Tambah Kebun
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[92svh] overflow-y-auto bg-white sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlantation ? "Edit Kebun Sawit" : "Tambah Kebun Sawit"}
            </DialogTitle>
            <DialogDescription>
              Kode kebun tidak dapat diubah setelah dibuat. Koordinat memakai bilangan integer.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-[#44483e]">Nama Kebun</span>
                <Input
                  value={formState.plantationName}
                  onChange={(event) => setFormState((current) => ({ ...current, plantationName: event.target.value }))}
                  placeholder="Kebun Alpha"
                  required
                />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-[#44483e]">Kode Unik</span>
                <Input
                  value={formState.plantationCode}
                  onChange={(event) => setFormState((current) => ({ ...current, plantationCode: event.target.value }))}
                  placeholder="BLK-A01"
                  disabled={Boolean(editingPlantation)}
                  required
                />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-[#44483e]">Luas Hektare</span>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formState.areaHectares}
                  onChange={(event) => setFormState((current) => ({ ...current, areaHectares: event.target.value }))}
                  placeholder="25"
                  required
                />
              </label>

              <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-[#f4f4ed] p-4 text-sm text-[#44483e]">
                <p className="font-semibold text-[#1a1c18]">
                  {validationMessage ? "Koordinat perlu diperiksa" : "Koordinat valid"}
                </p>
                <p className="mt-2 leading-6">
                  {validationMessage ?? "Persegi tidak overlap dengan kebun lain."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                  Koordinat Batas
                </h3>
                <p className="mt-1 text-sm text-[#74796d]">
                  Masukkan empat titik ujung kebun, misalnya [(0,0), (20,0), (20,20), (0,20)].
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {formState.corners.map((corner, index) => (
                  <div
                    key={`corner-${index}`}
                    className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-[#f4f4ed] p-4"
                  >
                    <p className="text-sm font-semibold text-[#1a1c18]">
                      Titik {index + 1}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        step="1"
                        value={corner.x}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            corners: current.corners.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, x: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="X"
                        required
                      />
                      <Input
                        type="number"
                        step="1"
                        value={corner.y}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            corners: current.corners.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, y: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="Y"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <PlantationMap
                plantations={[
                  ...plantations.filter((plantation) => plantation.plantationId !== editingPlantation?.plantationId),
                  {
                    plantationId: "preview",
                    plantationCode: formState.plantationCode || "PREVIEW",
                    plantationName: formState.plantationName || "Preview",
                    areaHectares: Number(formState.areaHectares) || 0,
                    corners: toPayload(formState).corners,
                    assignedForemanIds: [],
                    assignedDriverIds: [],
                  },
                ]}
                selectedPlantationId="preview"
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Batal
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={Boolean(validationMessage) || actionKey === "save-plantation"}>
                  <Plus className="size-4" />
                  {actionKey === "save-plantation" ? "Menyimpan..." : "Simpan Kebun"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  function renderListView() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#74796d]">Directory / Kebun</p>
            <h2 className="font-[var(--font-syne)] text-3xl font-bold text-[#1a1c18]">
              Manajemen Kebun Sawit
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
              <span className="sr-only">Cari kebun</span>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau kode..."
                className="pl-11"
              />
            </label>
            {renderPlantationDialog()}
          </div>
        </div>

        <PlantationMap
          plantations={plantations}
          selectedPlantationId={selectedPlantationId ?? undefined}
          onSelect={setSelectedPlantationId}
        />

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visiblePlantations.map((plantation) => {
            const isSelected = plantation.plantationId === selectedPlantationId;
            const plantationForeman = plantation.assignedForemanIds[0]
              ? foremen.find((foreman) => foreman.foremanId === plantation.assignedForemanIds[0])
              : null;

            return (
              <article
                key={plantation.plantationId}
                className={`rounded-lg border bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)] transition hover:-translate-y-0.5 hover:border-[#3f6901]/50 ${
                  isSelected ? "border-[#3f6901]" : "border-[rgba(116,121,109,0.24)]"
                }`}
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => setSelectedPlantationId(plantation.plantationId)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge>{plantation.assignedForemanIds.length ? "Aktif" : "Perlu Mandor"}</Badge>
                    <span className="rounded-lg bg-[#efeee7] px-3 py-2 text-sm font-bold text-[#44483e]">
                      {plantation.plantationCode}
                    </span>
                  </div>
                  <h3 className="mt-4 font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                    {plantation.plantationName}
                  </h3>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#f4f4ed] p-3">
                      <p className="mono-label text-[#74796d]">Luas</p>
                      <p className="mt-2 text-lg font-bold text-[#1a1c18]">
                        {plantation.areaHectares} ha
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#f4f4ed] p-3">
                      <p className="mono-label text-[#74796d]">Supir</p>
                      <p className="mt-2 text-lg font-bold text-[#1a1c18]">
                        {plantation.assignedDriverIds.length}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#44483e]">
                    {plantationForeman
                      ? `Mandor: ${plantationForeman.foremanName}`
                      : "Belum ada mandor yang mengawasi kebun ini."}
                  </p>
                </button>
                <div className="mt-5 flex gap-2 border-t border-[rgba(116,121,109,0.18)] pt-4">
                  <Button type="button" variant="secondary" onClick={() => setSelectedPlantationId(plantation.plantationId)}>
                    <Map className="size-4" />
                    Detail
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => openEditDialog(plantation)}>
                    <Edit3 className="size-4" />
                    Edit
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {!isLoading && visiblePlantations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[rgba(116,121,109,0.40)] bg-white px-5 py-10 text-center text-sm text-[#74796d]">
            Tidak ada kebun yang cocok dengan pencarian.
          </div>
        ) : null}
      </div>
    );
  }

  function renderDetailView(plantation: Plantation) {
    const availableForemen = foremen.filter((foreman) => foreman.foremanId !== assignedForeman?.foremanId);
    const availableDrivers = drivers.filter((driver) => !plantation.assignedDriverIds.includes(driver.driverId));

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" className="w-fit" onClick={() => setSelectedPlantationId(null)}>
            <ArrowLeft className="size-4" />
            Kembali ke Daftar
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => openEditDialog(plantation)}>
              <Edit3 className="size-4" />
              Edit Kebun
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a]"
              onClick={() => void handleDelete(plantation)}
              disabled={actionKey === `delete-${plantation.plantationId}`}
            >
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{plantation.assignedForemanIds.length ? "Aktif" : "Perlu Mandor"}</Badge>
            <Badge variant="muted">{plantation.plantationCode}</Badge>
          </div>
          <h2 className="mt-3 font-[var(--font-syne)] text-3xl font-bold text-[#1a1c18]">
            {plantation.plantationName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#44483e]">
            Koordinat: {formatCorners(plantation.corners)}
          </p>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
          <div className="space-y-5">
            <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
              <PlantationMap plantations={plantations} selectedPlantationId={plantation.plantationId} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#f4f4ed] p-3">
                  <p className="mono-label text-[#74796d]">Luas</p>
                  <p className="mt-2 text-xl font-bold text-[#1a1c18]">
                    {plantation.areaHectares} ha
                  </p>
                </div>
                <div className="rounded-lg bg-[#f4f4ed] p-3">
                  <p className="mono-label text-[#74796d]">Sisi Koordinat</p>
                  <p className="mt-2 text-xl font-bold text-[#1a1c18]">
                    {boundsOf(plantation.corners).maxX - boundsOf(plantation.corners).minX}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
              <div className="flex items-center gap-2 border-b border-[rgba(116,121,109,0.18)] px-5 py-4">
                <UserCheck className="size-5 text-[#2b4316]" />
                <h3 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                  Mandor Pengawas
                </h3>
              </div>
              <div className="p-5">
                {assignedForeman ? (
                  <div className="flex flex-col gap-3 rounded-lg border border-[rgba(116,121,109,0.18)] bg-[#f4f4ed] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-[#1a1c18]">{assignedForeman.foremanName}</p>
                      <p className="mt-1 text-sm text-[#74796d]">ID: {assignedForeman.employeeCode}</p>
                    </div>
                    <Badge>Aktif di kebun ini</Badge>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-[rgba(116,121,109,0.35)] px-4 py-5 text-sm text-[#74796d]">
                    Belum ada mandor yang ditugaskan.
                  </p>
                )}

                <div className="mt-4 overflow-hidden rounded-lg border border-[rgba(116,121,109,0.18)]">
                  {availableForemen.map((foreman) => {
                    const currentPlantation = findPlantationForForeman(plantations, foreman.foremanId);
                    return (
                      <div key={foreman.foremanId} className="flex flex-col gap-3 border-b border-[rgba(116,121,109,0.12)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-[#1a1c18]">{foreman.foremanName}</p>
                          <p className="mt-1 text-xs text-[#74796d]">
                            {currentPlantation ? `Saat ini di ${currentPlantation.plantationName}` : "Belum ditempatkan"}
                          </p>
                        </div>
                        <Button type="button" size="sm" onClick={() => void handleAssignForeman(foreman.foremanId)} disabled={actionKey === `foreman-${foreman.foremanId}`}>
                          <UserCheck className="size-4" />
                          {currentPlantation ? "Pindahkan" : "Assign"}
                        </Button>
                      </div>
                    );
                  })}
                  {availableForemen.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-[#74796d]">
                      Tidak ada mandor lain tersedia.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
              <div className="flex flex-col gap-3 border-b border-[rgba(116,121,109,0.18)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="size-5 text-[#2b4316]" />
                  <h3 className="font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                    Supir Truk
                  </h3>
                </div>
                <label className="relative min-w-0 sm:w-64">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
                  <span className="sr-only">Cari supir</span>
                  <Input
                    value={driverSearch}
                    onChange={(event) => setDriverSearch(event.target.value)}
                    placeholder="Cari supir..."
                    className="pl-11"
                  />
                </label>
              </div>
              <div className="divide-y divide-[rgba(116,121,109,0.12)]">
                {assignedDrivers.map((driver) => (
                  <div key={driver.driverId} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#cdedae] font-bold text-[#2b4316]">
                        {driver.driverName.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1a1c18]">{driver.driverName}</p>
                        <p className="mt-1 text-xs text-[#74796d]">Lisensi: {driver.licenseNumber}</p>
                      </div>
                    </div>
                    <Badge variant="muted">Aktif</Badge>
                  </div>
                ))}
                {assignedDrivers.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-[#74796d]">
                    Tidak ada supir yang cocok atau belum ada supir di kebun ini.
                  </p>
                ) : null}
              </div>
              <div className="border-t border-[rgba(116,121,109,0.18)] p-5">
                <h4 className="font-semibold text-[#1a1c18]">Assign atau pindahkan supir</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {availableDrivers.map((driver) => {
                    const currentPlantation = findPlantationForDriver(plantations, driver.driverId);
                    return (
                      <div key={driver.driverId} className="rounded-lg border border-[rgba(116,121,109,0.18)] p-3">
                        <p className="font-semibold text-[#1a1c18]">{driver.driverName}</p>
                        <p className="mt-1 text-xs text-[#74796d]">
                          {currentPlantation ? `Saat ini di ${currentPlantation.plantationName}` : `Lisensi ${driver.licenseNumber}`}
                        </p>
                        <Button type="button" size="sm" className="mt-3 w-full" onClick={() => void handleAssignDriver(driver.driverId)} disabled={actionKey === `driver-${driver.driverId}`}>
                          <Truck className="size-4" />
                          {currentPlantation ? "Pindahkan" : "Assign"}
                        </Button>
                      </div>
                    );
                  })}
                  {availableDrivers.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[rgba(116,121,109,0.35)] px-4 py-6 text-center text-sm text-[#74796d] md:col-span-2">
                      Tidak ada supir lain yang bisa ditugaskan ke kebun ini.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedback ? (
        <p className="rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] px-4 py-3 text-sm font-medium text-[#2b4316]">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm font-medium text-[#93000a]">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-48 animate-pulse rounded-lg bg-[#e3e3dc]" />
          <div className="h-48 animate-pulse rounded-lg bg-[#e3e3dc]" />
          <div className="h-48 animate-pulse rounded-lg bg-[#e3e3dc]" />
        </div>
      ) : selectedPlantation ? (
        renderDetailView(selectedPlantation)
      ) : (
        renderListView()
      )}
    </div>
  );
}
