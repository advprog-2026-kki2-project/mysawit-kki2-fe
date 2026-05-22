export type HarvestSubmissionPayload = {
  harvestDate: string;
  weightKg: string;
  notes: string;
  photos: File[];
};

export type HarvestSubmissionResult = {
  message: string;
  id: string;
  laborerName: string;
  harvestDate: string;
  weightKg: number;
  notes: string;
  photoPaths: string[];
  status: string;
};

export type HarvestRecord = {
  id: string;
  laborerName: string;
  harvestDate: string;
  weightKg: number;
  notes: string;
  photoPath: string;
  photoPaths: string[];
  photoUrls: string[];
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type LaborerHarvestFilters = {
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type ForemanHarvestFilters = {
  laborerName?: string;
  harvestDate?: string;
};
