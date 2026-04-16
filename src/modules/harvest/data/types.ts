export type HarvestSubmissionPayload = {
  harvestDate: string;
  weightKg: string;
  notes: string;
  photo: File;
};

export type HarvestSubmissionResult = {
  message: string;
  id: string;
  laborerName: string;
  harvestDate: string;
  weightKg: number;
  notes: string;
  status: string;
};
