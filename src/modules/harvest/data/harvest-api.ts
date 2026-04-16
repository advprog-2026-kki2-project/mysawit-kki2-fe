import { requestFormData } from "@/lib/api-client";
import type {
  HarvestSubmissionPayload,
  HarvestSubmissionResult,
} from "@/modules/harvest/data/types";

export function submitHarvest(payload: HarvestSubmissionPayload) {
  const formData = new FormData();
  formData.append("harvestDate", payload.harvestDate);
  formData.append("weightKg", payload.weightKg);
  formData.append("notes", payload.notes);
  formData.append("photo", payload.photo);

  return requestFormData<HarvestSubmissionResult>("/api/harvests", formData, {
    method: "POST",
  });
}
