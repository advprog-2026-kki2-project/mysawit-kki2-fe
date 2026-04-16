"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/modules/auth/data/auth-api";
import { roleLabels, type Role } from "@/modules/auth/data/types";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import {
  createPlantation,
  deletePlantation,
  getPlantations,
  updatePlantation,
} from "@/modules/plantation/data/plantation-api";
import type {
  Plantation,
  PlantationCoordinate,
} from "@/modules/plantation/data/types";

type PlantationFormState = {
  plantationCode: string;
  plantationName: string;
  areaHectares: string;
  corners: Array<{ x: string; y: string }>;
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
  };
}

export function PlantationManager() {
  const { session, isLoading } = useAuthSession();
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [formState, setFormState] = useState<PlantationFormState>(emptyFormState);
  const [editingPlantationId, setEditingPlantationId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPlantations() {
    setIsFetching(true);
    setError(null);

    try {
      const result = await getPlantations();
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

  useEffect(() => {
    if (session?.role === "ADMIN") {
      void loadPlantations();
    }
  }, [session?.role]);

  function resetForm() {
    setFormState(emptyFormState);
    setEditingPlantationId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = buildPayload(formState);
      const result = editingPlantationId
        ? await updatePlantation(editingPlantationId, payload)
        : await createPlantation(payload);

      setFeedback(
        editingPlantationId
          ? `Plantation ${result.plantationName} berhasil diperbarui.`
          : `Plantation ${result.plantationName} berhasil dibuat.`
      );
      resetForm();
      await loadPlantations();
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Perubahan plantation gagal disimpan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(plantationId: string) {
    setFeedback(null);
    setError(null);

    try {
      await deletePlantation(plantationId);
      setFeedback("Plantation berhasil dihapus.");
      startTransition(() => {
        void loadPlantations();
      });
      if (editingPlantationId === plantationId) {
        resetForm();
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError || caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Plantation gagal dihapus.");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-[1.5rem] bg-[#f5f5f5]" />
        <div className="h-64 animate-pulse rounded-[1.5rem] bg-[#f5f5f5]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="surface-panel rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Login diperlukan.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
          Masuk sebagai admin untuk mengelola data plantation.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    );
  }

  if (session.role !== "ADMIN") {
    return (
      <div className="surface-panel rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
          Akses dibatasi.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#666666]">
          Halaman ini hanya untuk admin. Sesi aktif Anda menggunakan role{" "}
          {formatRole(session.role).toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono-label text-[#888888]">Plantation Form</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
              {editingPlantationId ? "Edit plantation." : "Tambah plantation."}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#666666]">
              Isi kode, area, dan empat titik koordinat.
            </p>
          </div>
          {editingPlantationId ? (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Batal edit
            </Button>
          ) : null}
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#333333]" htmlFor="plantation-code">
              Kode plantation
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
              placeholder="PLT-20260416-0001"
              disabled={Boolean(editingPlantationId)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#333333]" htmlFor="plantation-name">
              Nama plantation
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
              placeholder="Kebun Barat"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#333333]" htmlFor="area-hectares">
              Area (hektar)
            </label>
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
              placeholder="25"
              required
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-[#333333]">Koordinat sudut</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {formState.corners.map((corner, index) => (
                <div
                  key={`corner-${index}`}
                  className="rounded-[1.5rem] border border-[rgba(13,13,13,0.05)] bg-white p-4"
                >
                  <p className="text-sm font-medium text-[#0d0d0d]">
                    Titik {index + 1}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                      placeholder="X"
                      required
                    />
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
                      placeholder="Y"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            <Plus className="size-4" />
            {isSubmitting
              ? "Menyimpan..."
              : editingPlantationId
                ? "Simpan perubahan"
                : "Tambah plantation"}
          </Button>
        </form>

        {feedback ? (
          <p className="mt-4 rounded-[1.3rem] border border-[rgba(24,226,153,0.18)] bg-[rgba(212,250,232,0.55)] px-4 py-3 text-sm text-[#0d0d0d]">
            {feedback}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-[1.3rem] border border-[rgba(212,86,86,0.25)] bg-[rgba(212,86,86,0.06)] px-4 py-3 text-sm text-[#a54141]">
            {error}
          </p>
        ) : null}
      </section>

      <section className="surface-panel rounded-[2rem] p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono-label text-[#888888]">Plantation List</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0d0d0d]">
              Data plantation aktif.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#666666]">
              Gunakan edit untuk memuat data ke form.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => void loadPlantations()}>
            Muat ulang
          </Button>
        </div>

        <div className="mt-8 space-y-4">
          {isFetching ? (
            <div className="space-y-3">
              <div className="h-28 animate-pulse rounded-[1.5rem] bg-[#f5f5f5]" />
              <div className="h-28 animate-pulse rounded-[1.5rem] bg-[#f5f5f5]" />
            </div>
          ) : plantations.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[rgba(13,13,13,0.1)] px-5 py-8 text-sm text-[#666666]">
              Belum ada plantation yang tersimpan.
            </div>
          ) : (
            plantations.map((plantation) => (
              <article
                key={plantation.plantationId}
                className="rounded-[1.6rem] border border-[rgba(13,13,13,0.05)] bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="mono-label text-[#888888]">
                      {plantation.plantationCode}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#0d0d0d]">
                      {plantation.plantationName}
                    </h3>
                    <p className="mt-2 text-sm text-[#666666]">
                      Area {plantation.areaHectares} hektar
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#666666]">
                      {plantation.corners
                        .map((corner) => `(${corner.x}, ${corner.y})`)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingPlantationId(plantation.plantationId);
                        setFormState(toFormState(plantation));
                        setFeedback(null);
                        setError(null);
                      }}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void handleDelete(plantation.plantationId)}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
