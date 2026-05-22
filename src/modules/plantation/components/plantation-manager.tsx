"use client";

import { startTransition, useEffect, useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Trash2,
  LayoutGrid,
  Table,
  RefreshCw,
  Search,
  User,
  Truck,
  MapPin,
  AlertTriangle,
  Compass
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ApiError } from "@/modules/auth/data/auth-api";
import { roleLabels, type Role } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import {
  createPlantation,
  deletePlantation,
  getPlantations,
  updatePlantation,
  getDrivers,
  getForemen,
} from "@/modules/plantation/data/plantation-api";
import type {
  Plantation,
  PlantationCoordinate,
  Driver,
  Foreman,
} from "@/modules/plantation/data/types";
import { CoordinateVisualizer } from "./coordinate-visualizer";

type PlantationFormState = {
  plantationCode: string;
  plantationName: string;
  areaHectares: string;
  corners: Array<{ x: string; y: string }>;
  assignedForemanIds: string[];
  assignedDriverIds: string[];
};

const emptyFormState: PlantationFormState = {
  plantationCode: "",
  plantationName: "",
  areaHectares: "",
  corners: [
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
  ],
  assignedForemanIds: [],
  assignedDriverIds: [],
};

function formatRole(role: Role) {
  return roleLabels[role];
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
    assignedForemanIds: plantation.assignedForemanIds || [],
    assignedDriverIds: plantation.assignedDriverIds || [],
  };
}

function buildPayload(formState: PlantationFormState) {
  return {
    plantationCode: formState.plantationCode.trim(),
    plantationName: formState.plantationName.trim(),
    areaHectares: Number(formState.areaHectares),
    corners: formState.corners.map(
      (corner): PlantationCoordinate => ({
        x: Number(corner.x),
        y: Number(corner.y),
      }),
    ),
    assignedForemanIds: formState.assignedForemanIds,
    assignedDriverIds: formState.assignedDriverIds,
  };
}

export function PlantationManager() {
  const { session, isLoading } = useAuthSession();
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [formState, setFormState] = useState<PlantationFormState>(emptyFormState);
  const [editingPlantationId, setEditingPlantationId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedPlantation, setSelectedPlantation] = useState<Plantation | null>(null);
  const [driverSearchQuery, setDriverSearchQuery] = useState("");

  const [overlapMessage, setOverlapMessage] = useState<string | null>(null);
  const [hasOverlap, setHasOverlap] = useState(false);

  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [allForemen, setAllForemen] = useState<Foreman[]>([]);

  const [filterName, setFilterName] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterForemanId, setFilterForemanId] = useState("");

  async function loadPlantations(nameVal = filterName, codeVal = filterCode, foremanIdVal = filterForemanId) {
    setIsFetching(true);
    setError(null);
    try {
      const result = await getPlantations({
        name: nameVal.trim() || undefined,
        code: codeVal.trim() || undefined,
        foremanId: foremanIdVal || undefined,
      });
      setPlantations(result);
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Data plantation tidak dapat dimuat.");
      }
    } finally {
      setIsFetching(false);
    }
  }

  async function loadWorkers() {
    try {
      const [driversData, foremenData] = await Promise.all([
        getDrivers(),
        getForemen(),
      ]);
      setAllDrivers(driversData);
      setAllForemen(foremenData);
    } catch (caughtError) {
      console.error("Gagal memuat data pekerja:", caughtError);
    }
  }

  useEffect(() => {
    if (session?.role === "ADMIN" || session?.role === "FOREMAN") {
      void loadPlantations(filterName, filterCode, filterForemanId);
      void loadWorkers();
    }
  }, [session?.role, filterName, filterCode, filterForemanId]);

  function resetForm() {
    setFormState(emptyFormState);
    setEditingPlantationId(null);
    setOverlapMessage(null);
    setHasOverlap(false);
    setIsFormOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasOverlap) {
      setFeedback({
        type: "error",
        text: "Coordinate detected overlapping."
      });
      return;
    }

    setFeedback(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = buildPayload(formState);
      const result = editingPlantationId
        ? await updatePlantation(editingPlantationId, payload)
        : await createPlantation(payload);

      setFeedback({
        type: "success",
        text: editingPlantationId
          ? `Plantation "${result.plantationName}" successfully updated.`
          : `Plantation "${result.plantationName}" successfully added.`
      });
      resetForm();
      await loadPlantations();
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Change cannot be saved.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(plantationId: string) {
    if (!confirm("Are you sure you want to delete this plantation?")) return;
    setFeedback(null);
    setError(null);

    try {
      await deletePlantation(plantationId);
      setFeedback({ type: "success", text: "Plantation successfully deleted." });
      startTransition(() => {
        void loadPlantations();
      });
      if (editingPlantationId === plantationId) {
        resetForm();
      }
      if (selectedPlantation?.plantationId === plantationId) {
        setSelectedPlantation(null);
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Plantation deletion failed.");
      }
    }
  }

  const filteredDrivers = useMemo(() => {
    if (!selectedPlantation || !selectedPlantation.assignedDriverIds) return [];
    const assignedDrivers = selectedPlantation.assignedDriverIds
      .map((id) => allDrivers.find((d) => d.driverId === id))
      .filter((d): d is Driver => Boolean(d));

    if (!driverSearchQuery.trim()) return assignedDrivers;
    return assignedDrivers.filter((d) =>
      d.driverName.toLowerCase().includes(driverSearchQuery.toLowerCase())
    );
  }, [selectedPlantation, allDrivers, driverSearchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded-[1.5rem] bg-[#f5f5f5]" />
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-[500px] animate-pulse rounded-[2rem] bg-[#f5f5f5]" />
          <div className="h-[500px] animate-pulse rounded-[2rem] bg-[#f5f5f5]" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[2rem] border border-[#DADAD3] bg-[#FDFBEA] p-8 text-center max-w-lg mx-auto mt-10 shadow-[0_2px_8px_rgba(26,28,24,0.05)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#E8F0DE] text-[#415B2B]">
          <Compass className="size-7" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#1A1C18]">
          Login Required
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#3D4038]">
          Please login as administrator to access plantation management module.
        </p>
        <Button asChild className="mt-6 bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21]">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (session.role !== "ADMIN" && session.role !== "FOREMAN") {
    return (
      <div className="rounded-[2rem] border border-[#DADAD3] bg-[#FDFBEA] p-8 text-center max-w-lg mx-auto mt-10 shadow-[0_2px_8px_rgba(26,28,24,0.05)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FFDAD6] text-[#BA1A1A]">
          <AlertTriangle className="size-7" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#1A1C18]">
          Limited Access
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#3D4038]">
          This page is only for administrator and foreman role. Your active session is registered as{" "}
          <strong className="text-[#415B2B]">{formatRole(session.role)}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-[#E8E8DF] rounded-[1.5rem] p-4 shadow-[0_2px_8px_rgba(26,28,24,0.05)]">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] border-[#415B2B]" : "text-[#415B2B] hover:bg-[#F3F8EC]"}
          >
            <LayoutGrid className="size-4" />
            Grid Overview
          </Button>
          <Button
            variant={viewMode === "table" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] border-[#415B2B]" : "text-[#415B2B] hover:bg-[#F3F8EC]"}
          >
            <Table className="size-4" />
            Admin Audit Table
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#5F6358]">
            Total: {plantations.length} Plantation
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void loadPlantations(filterName, filterCode, filterForemanId)}
            disabled={isFetching}
            className="border-[#DADAD3] text-[#3D4038] hover:bg-[#FDFBEA] h-9"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (isFormOpen) {
                resetForm();
              } else {
                setIsFormOpen(true);
              }
            }}
            className="bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] border-[#415B2B] h-9 gap-1 font-bold"
          >
            <Plus className={`size-4 transition-transform duration-200 ${isFormOpen ? "rotate-45" : ""}`} />
            {isFormOpen ? "Close Form" : "Register Plantation"}
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#E8E8DF] rounded-[1.5rem] p-5 shadow-[0_2px_8px_rgba(26,28,24,0.05)] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1A1C18] flex items-center gap-1.5">
            <Search className="size-4 text-[#415B2B]" />
            Search & Filter Plantation
          </h4>
          {(filterName || filterCode || filterForemanId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterName("");
                setFilterCode("");
                setFilterForemanId("");
              }}
              className="text-[#BA1A1A] hover:bg-[#FFDAD6] h-8 text-xs font-semibold"
            >
              Reset Filter
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="filter-name" className="text-[10px] font-bold text-[#5F6358] uppercase tracking-wider">Plantation Name</label>
            <Input
              id="filter-name"
              placeholder="Search plantation name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="h-10 text-xs rounded-lg border-[#DADAD3]"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="filter-code" className="text-[10px] font-bold text-[#5F6358] uppercase tracking-wider">Plantation Code</label>
            <Input
              id="filter-code"
              placeholder="Search plantation code..."
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="h-10 text-xs rounded-lg border-[#DADAD3]"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="filter-foreman" className="text-[10px] font-bold text-[#5F6358] uppercase tracking-wider">Foreman</label>
            <select
              id="filter-foreman"
              value={filterForemanId}
              onChange={(e) => setFilterForemanId(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#DADAD3] bg-white px-2.5 text-xs focus-visible:ring-[#80B048]/20 focus-visible:border-[#415B2B]"
            >
              <option value="">-- All Foreman --</option>
              {allForemen.map((f) => (
                <option key={f.foremanId} value={f.foremanId}>
                  {f.foremanName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isFormOpen && (
          <section className="border border-[#E8E8DF] bg-[#FDFBEA] shadow-[0_2px_8px_rgba(26,28,24,0.05)] rounded-[2rem] p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="mono-label text-[#415B2B] text-xs font-bold uppercase tracking-wider">Plantation Form</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1C18]">
                  {editingPlantationId ? "Edit Plantation" : "Add Plantation"}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#3D4038]">
                  Fill in the name, code, area, and four corner coordinates of the plantation.
                </p>
              </div>
              {editingPlantationId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-[#774E15] hover:bg-[#F3E7D2] hover:text-[#774E15]"
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider" htmlFor="plantation-code">
                  Plantation Code <span className="text-[#BA1A1A]">*</span>
                </label>
                <Input
                  id="plantation-code"
                  value={formState.plantationCode}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      plantationCode: event.target.value,
                    }))
                  }
                  placeholder="Example: PLT-YYYYMMDD-XXXX"
                  disabled={Boolean(editingPlantationId)}
                  required
                  className="h-11 rounded-lg border-[#DADAD3] bg-white placeholder-[#8A8D83] focus-visible:ring-[#80B048]/20 focus-visible:border-[#415B2B]"
                />
                <p className="text-[11px] text-[#5F6358]">
                  Unique code to identify the plantation. Cannot be changed after creation.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider" htmlFor="plantation-name">
                  Plantation Name <span className="text-[#BA1A1A]">*</span>
                </label>
                <Input
                  id="plantation-name"
                  value={formState.plantationName}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      plantationName: event.target.value,
                    }))
                  }
                  placeholder="Example: Kebun Sejahtera Blok B"
                  required
                  className="h-11 rounded-lg border-[#DADAD3] bg-white placeholder-[#8A8D83] focus-visible:ring-[#80B048]/20 focus-visible:border-[#415B2B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider" htmlFor="area-hectares">
                  Area Size (Hectares) <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="area-hectares"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.areaHectares}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        areaHectares: event.target.value,
                      }))
                    }
                    placeholder="24.5"
                    required
                    className="h-11 pr-14 rounded-lg border-[#DADAD3] bg-white placeholder-[#8A8D83] focus-visible:ring-[#80B048]/20 focus-visible:border-[#415B2B]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-sm font-semibold text-[#5F6358]">
                    Ha
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider">
                    Corner Coordinates (4 Points) <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <span className="text-[11px] text-[#5F6358]">2D numerical values</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {formState.corners.map((corner, index) => (
                    <div
                      key={`corner-input-${index}`}
                      className="rounded-xl border border-[#E8E8DF] bg-white p-3.5 shadow-[0_1px_3px_rgba(26,28,24,0.02)]"
                    >
                      <span className="text-[11px] font-bold text-[#415B2B] uppercase tracking-wider">
                        Corner Point {index + 1}
                      </span>
                      <div className="mt-2.5 grid gap-2 grid-cols-2">
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            value={corner.x}
                            onChange={(event) =>
                              setFormState((current) => ({
                                ...current,
                                corners: current.corners.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, x: event.target.value }
                                    : item,
                                ),
                              }))
                            }
                            placeholder="Absis X"
                            required
                            className="h-9 px-2 text-center text-xs rounded-md border-[#DADAD3]"
                          />
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            value={corner.y}
                            onChange={(event) =>
                              setFormState((current) => ({
                                ...current,
                                corners: current.corners.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, y: event.target.value }
                                    : item,
                                ),
                              }))
                            }
                            placeholder="Ordinat Y"
                            required
                            className="h-9 px-2 text-center text-xs rounded-md border-[#DADAD3]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E8E8DF]">
                <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider">
                  Preview Grid Map
                </label>
                <CoordinateVisualizer
                  plantations={plantations}
                  currentCorners={formState.corners}
                  editingId={editingPlantationId}
                  onOverlapChange={(overlap, msg) => {
                    setHasOverlap(overlap);
                    setOverlapMessage(msg);
                  }}
                />
                {overlapMessage && (
                  <p className="mt-2 text-xs font-medium text-[#BA1A1A] bg-[#FFDAD6] p-2.5 rounded-lg border border-[#BA1A1A]/10">
                    {overlapMessage}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E8E8DF]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider" htmlFor="plantation-foreman">
                    Select Foreman (Supervisor)
                  </label>
                  <select
                    id="plantation-foreman"
                    value={formState.assignedForemanIds[0] || ""}
                    onChange={(event) => {
                      const val = event.target.value;
                      setFormState((current) => ({
                        ...current,
                        assignedForemanIds: val ? [val] : [],
                      }));
                    }}
                    className="h-11 w-full rounded-lg border border-[#DADAD3] bg-white px-3 text-sm focus-visible:ring-[#80B048]/20 focus-visible:border-[#415B2B]"
                  >
                    <option value="">-- Select Foreman (Optional) --</option>
                    {allForemen.map((foreman) => (
                      <option key={foreman.foremanId} value={foreman.foremanId}>
                        {foreman.foremanName} ({foreman.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D4038] uppercase tracking-wider">
                    Select Driver (Multiple selection allowed)
                  </label>
                  <div className="rounded-xl border border-[#E8E8DF] bg-white p-3 max-h-[180px] overflow-y-auto space-y-2">
                    {allDrivers.length === 0 ? (
                      <p className="text-xs text-[#5F6358] text-center py-4">No drivers registered yet</p>
                    ) : (
                      allDrivers.map((driver) => {
                        const isChecked = formState.assignedDriverIds.includes(driver.driverId);
                        return (
                          <label
                            key={driver.driverId}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F3F8EC]/50 cursor-pointer transition-colors text-xs font-medium text-[#3D4038]"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormState((current) => {
                                  const currentIds = current.assignedDriverIds;
                                  const newIds = checked
                                    ? [...currentIds, driver.driverId]
                                    : currentIds.filter((id) => id !== driver.driverId);
                                  return {
                                    ...current,
                                    assignedDriverIds: newIds,
                                  };
                                });
                              }}
                              className="rounded border-[#DADAD3] text-[#415B2B] focus:ring-[#80B048]/20 h-4 w-4"
                            />
                            <div className="flex-1">
                              <span className="font-semibold block">{driver.driverName}</span>
                              <span className="text-[10px] text-[#5F6358]">License: {driver.licenseNumber}</span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-11 bg-[#415B2B] text-[#FFFFF1] hover:bg-[#314A21] rounded-lg font-sans font-bold transition-all mt-4"
                type="submit"
                disabled={isSubmitting || hasOverlap}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <RefreshCw className="size-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Plus className="size-4" />
                    {editingPlantationId ? "Save Changes" : "Add Plantation"}
                  </span>
                )}
              </Button>
            </form>

            {feedback && (
              <div
                className={`rounded-xl border p-3.5 text-xs font-medium transition-all ${feedback.type === "success"
                  ? "border-[#2F7D4C]/25 bg-[#DAF1E3] text-[#2F7D4C]"
                  : "border-[#BA1A1A]/25 bg-[#FFDAD6] text-[#BA1A1A]"
                  }`}
              >
                {feedback.text}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-[#BA1A1A]/25 bg-[#FFDAD6] px-4 py-3.5 text-xs text-[#BA1A1A] font-medium">
                {error}
              </div>
            )}
          </section>
        )}

        <section className="space-y-4">
          {isFetching ? (
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-2xl bg-white border border-[#E8E8DF]" />
              <div className="h-32 animate-pulse rounded-2xl bg-white border border-[#E8E8DF]" />
            </div>
          ) : plantations.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#DADAD3] bg-white/50 px-6 py-12 text-center text-[#5F6358]">
              <Compass className="size-10 mx-auto text-[#8A8D83]" />
              <h3 className="mt-4 text-lg font-bold text-[#1A1C18]">No Plantation Found</h3>
              <p className="mt-1 text-xs text-[#5F6358]">
                Use the form to register a new plantation.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plantations.map((plantation) => {
                return (
                  <article
                    key={plantation.plantationId}
                    className="border border-[#E8E8DF] bg-white p-5 rounded-[1.6rem] hover:border-[#415B2B]/40 cursor-pointer shadow-[0_2px_8px_rgba(26,28,24,0.05)] transition-all duration-200"
                    onClick={() => setSelectedPlantation(plantation)}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-[#E8F0DE] text-[#415B2B] px-2.5 py-0.5 rounded-full font-bold">
                            {plantation.plantationCode}
                          </span>
                          <span className="font-mono text-[10px] bg-[#DAF1E3] text-[#2F7D4C] px-2.5 py-0.5 rounded-full font-bold">
                            ACTIVE
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1C18] hover:text-[#415B2B]">
                          {plantation.plantationName}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs pt-1.5 border-t border-[#F0F0E8]">
                          <div>
                            <span className="text-[#5F6358]">Area: </span>
                            <strong className="text-[#3D4038]">{plantation.areaHectares} Hectares</strong>
                          </div>
                          <div>
                            <span className="text-[#5F6358]">Workers: </span>
                            <strong className="text-[#3D4038]">
                              {(plantation.assignedDriverIds || []).length} Driver
                            </strong>
                          </div>
                          <div className="col-span-2 mt-1">
                            <span className="text-[#5F6358]">Foreman: </span>
                            <strong className="text-[#3D4038]">
                              {plantation.assignedForemanIds && plantation.assignedForemanIds.length > 0
                                ? plantation.assignedForemanIds
                                  .map((id) => allForemen.find((f) => f.foremanId === id)?.foremanName || id)
                                  .join(", ")
                                : "Not Assigned"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 justify-end self-end sm:self-start" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingPlantationId(plantation.plantationId);
                            setFormState(toFormState(plantation));
                            setIsFormOpen(true);
                            setFeedback(null);
                            setError(null);
                          }}
                          className="border-[#DADAD3] text-[#3D4038] hover:bg-[#FDFBEA] h-9"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDelete(plantation.plantationId)}
                          className="text-[#BA1A1A] hover:bg-[#FFDAD6] hover:text-[#BA1A1A] h-9"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-[#F0F0E8] flex items-center justify-between text-xs text-[#5F6358]">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-[#415B2B]" />
                        Corner Coordinate Details
                      </span>
                      <span className="font-mono text-[10px]">
                        {plantation.corners[0] ? `(${plantation.corners[0].x}, ${plantation.corners[0].y})` : ""} ...
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-[#E8E8DF] bg-white shadow-[0_2px_8px_rgba(26,28,24,0.05)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FDFBEA] border-b border-[#E8E8DF] border-dashed">
                      <th className="px-5 py-4 text-xs font-bold text-[#3D4038] uppercase tracking-wider">Name & Code</th>
                      <th className="px-5 py-4 text-xs font-bold text-[#3D4038] uppercase tracking-wider">Area</th>
                      <th className="px-5 py-4 text-xs font-bold text-[#3D4038] uppercase tracking-wider">Coordinates</th>
                      <th className="px-5 py-4 text-xs font-bold text-[#3D4038] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0E8]">
                    {plantations.map((plantation) => (
                      <tr
                        key={plantation.plantationId}
                        className="hover:bg-[#F3F8EC]/50 cursor-pointer transition-colors duration-100"
                        onClick={() => setSelectedPlantation(plantation)}
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#1A1C18]">{plantation.plantationName}</div>
                          <div className="font-mono text-[10px] text-[#415B2B] mt-0.5">{plantation.plantationCode}</div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#3D4038]">
                          {plantation.areaHectares} Ha
                        </td>
                        <td className="px-5 py-4 font-mono text-[10.5px] text-[#5F6358] max-w-[200px] truncate">
                          {plantation.corners
                            .map((corner) => `(${corner.x}, ${corner.y})`)
                            .join(" · ")}
                        </td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingPlantationId(plantation.plantationId);
                                setFormState(toFormState(plantation));
                                setIsFormOpen(true);
                                setFeedback(null);
                                setError(null);
                              }}
                              className="size-8 text-[#3D4038] hover:bg-[#FDFBEA]"
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => void handleDelete(plantation.plantationId)}
                              className="size-8 text-[#BA1A1A] hover:bg-[#FFDAD6]"
                              title="Hapus"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <Sheet open={Boolean(selectedPlantation)} onOpenChange={(open) => !open && setSelectedPlantation(null)}>
        <SheetContent className="overflow-y-auto">
          {selectedPlantation && (
            <div className="space-y-6 pt-5">
              <SheetHeader className="px-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-[#E8F0DE] text-[#415B2B] px-2.5 py-0.5 rounded-full font-bold">
                    {selectedPlantation.plantationCode}
                  </span>
                  <span className="font-mono text-[10px] bg-[#DAF1E3] text-[#2F7D4C] px-2.5 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                </div>
                <SheetTitle className="text-2xl font-bold mt-2 text-[#1A1C18]">
                  {selectedPlantation.plantationName}
                </SheetTitle>
                <SheetDescription>
                  Spatial management & detailed audit of oil palm plantations.
                </SheetDescription>
              </SheetHeader>

              <Separator className="bg-[#E8E8DF]" />

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#E8E8DF] bg-[#FDFBEA] p-4">
                  <span className="text-[10px] font-bold text-[#5F6358] uppercase tracking-wider">Total Area</span>
                  <p className="text-2xl font-extrabold text-[#415B2B] mt-1">
                    {selectedPlantation.areaHectares} <span className="text-sm font-semibold">Ha</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E8E8DF] bg-[#FDFBEA] p-4">
                  <span className="text-[10px] font-bold text-[#5F6358] uppercase tracking-wider">Drivers</span>
                  <p className="text-2xl font-extrabold text-[#415B2B] mt-1">
                    {(selectedPlantation.assignedDriverIds || []).length} <span className="text-sm font-semibold">Drivers</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8E8DF] bg-white p-5 space-y-3 shadow-sm">
                <h4 className="text-sm font-bold text-[#1A1C18] flex items-center gap-1.5">
                  <MapPin className="size-4 text-[#415B2B]" />
                  Plantation Coordinates
                </h4>
                <div className="grid gap-2 grid-cols-2 font-mono text-xs">
                  {selectedPlantation.corners.map((corner, i) => (
                    <div key={`detail-corner-${i}`} className="bg-[#FDFBEA]/50 p-2.5 rounded border border-[#E8E8DF]">
                      <span className="text-[10px] font-bold text-[#415B2B] block mb-0.5">Corner {i + 1}</span>
                      X: {corner.x} · Y: {corner.y}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8E8DF] bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-[#1A1C18] flex items-center gap-1.5">
                  <User className="size-4 text-[#415B2B]" />
                  Selected Foreman
                </h4>
                {selectedPlantation.assignedForemanIds && selectedPlantation.assignedForemanIds.length > 0 ? (
                  selectedPlantation.assignedForemanIds.map((id) => {
                    const foreman = allForemen.find((f) => f.foremanId === id);
                    const name = foreman ? foreman.foremanName : id;
                    return (
                      <div key={id} className="flex items-center gap-3 bg-[#F3F8EC] p-3.5 rounded-xl border border-[#E8F0DE]">
                        <div className="size-9 rounded-full bg-[#415B2B] text-[#FFFFF1] flex items-center justify-center font-bold text-sm">
                          {name[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-[#1A1C18]">{name}</h5>
                          <p className="text-[11px] text-[#415B2B]">
                            {foreman ? `Kode Pegawai: ${foreman.employeeCode}` : "Supervisor Lapangan Aktif"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#5F6358] py-2 text-center">Not Assigned Foreman</p>
                )}
              </div>

              <div className="rounded-2xl border border-[#E8E8DF] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1A1C18] flex items-center gap-1.5">
                    <Truck className="size-4 text-[#415B2B]" />
                    Driver List
                  </h4>
                  <span className="text-[11px] text-[#5F6358] bg-[#F0F0E8] px-2 py-0.5 rounded font-bold">
                    {filteredDrivers.length} Drivers
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-[#8A8D83]" />
                  <Input
                    placeholder="Cari driver..."
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                    className="h-10 pl-9 pr-4 text-xs rounded-lg border-[#DADAD3]"
                  />
                </div>
                <div className="divide-y divide-[#E8E8DF] max-h-[140px] overflow-y-auto pr-1">
                  {filteredDrivers.length === 0 ? (
                    <p className="text-xs text-[#5F6358] py-3 text-center">Driver not found</p>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <div key={driver.driverId} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-[#3D4038]">{driver.driverName}</span>
                          <span className="text-[10px] text-[#5F6358] block">{driver.licenseNumber}</span>
                        </div>
                        <span className="text-[10px] text-[#2F7D4C] font-bold bg-[#DAF1E3]/50 px-2 py-0.5 rounded">
                          Tersedia
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>


              <div className="pt-2">
                <Button
                  className="w-full border-[#DADAD3] text-[#3D4038] hover:bg-[#FDFBEA]"
                  variant="secondary"
                  onClick={() => setSelectedPlantation(null)}
                >
                  Close Plantation Details
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
