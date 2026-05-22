"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getForemanHarvestPhoto,
  getLaborerHarvestPhoto,
} from "@/modules/harvest/data/harvest-api";
import type { HarvestRecord } from "@/modules/harvest/data/types";

type HarvestPhotoThumbProps = {
  record: HarvestRecord;
  index?: number;
  scope: "laborer" | "foreman";
  className?: string;
};

function photoReferenceOf(record: HarvestRecord, index: number) {
  if (record.photoPaths?.length) {
    return record.photoPaths[index] ?? null;
  }

  return index === 0 ? record.photoPath : null;
}

function isPublicUrl(reference: string | null) {
  return Boolean(reference?.startsWith("http://") || reference?.startsWith("https://"));
}

export function HarvestPhotoThumb({
  record,
  index = 0,
  scope,
  className,
}: HarvestPhotoThumbProps) {
  const photoKey = `${scope}:${record.id}:${index}`;
  const photoReference = photoReferenceOf(record, index);
  const directImageUrl = isPublicUrl(photoReference) ? photoReference : null;
  const [photoState, setPhotoState] = useState<{
    failed?: boolean;
    key: string;
    url?: string;
  }>({ key: "" });

  useEffect(() => {
    if (directImageUrl) {
      return;
    }

    let isActive = true;
    let objectUrl: string | null = null;

    const loadPhoto = scope === "foreman" ? getForemanHarvestPhoto : getLaborerHarvestPhoto;

    loadPhoto(record.id, index)
      .then((blob) => {
        if (!isActive) return;
        objectUrl = URL.createObjectURL(blob);
        setPhotoState({ key: photoKey, url: objectUrl });
      })
      .catch(() => {
        if (isActive) setPhotoState({ failed: true, key: photoKey });
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [directImageUrl, index, photoKey, record.id, scope]);

  const isCurrentPhoto = photoState.key === photoKey;
  const imageUrl = directImageUrl ?? (isCurrentPhoto ? photoState.url : null);
  const failed = isCurrentPhoto && photoState.failed;

  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] min-h-28 items-center justify-center overflow-hidden rounded-lg border border-[rgba(116,121,109,0.18)] bg-[#f4f4ed]",
        className,
      )}
    >
      {imageUrl ? (
        // R2 public URLs and blob URLs do not benefit from Next Image optimization here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`Foto panen ${record.laborerName}`}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-[#74796d]">
          <ImageIcon className="size-5" />
          <span className="text-xs font-semibold">{failed ? "Foto tidak tersedia" : "Memuat foto"}</span>
        </div>
      )}
    </div>
  );
}
