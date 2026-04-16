export type PlantationCoordinate = {
  x: number;
  y: number;
};

export type Plantation = {
  plantationId: string;
  plantationCode: string;
  plantationName: string;
  areaHectares: number;
  corners: PlantationCoordinate[];
};

export type PlantationPayload = {
  plantationCode: string;
  plantationName: string;
  areaHectares: number;
  corners: PlantationCoordinate[];
};
