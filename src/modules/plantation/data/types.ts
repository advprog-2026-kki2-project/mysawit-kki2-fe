export type PlantationCoordinate = {
  x: number;
  y: number;
};

export type Foreman = {
  foremanId: string;
  foremanName: string;
  employeeCode: string;
};

export type Driver = {
  driverId: string;
  driverName: string;
  licenseNumber: string;
};

export type Plantation = {
  plantationId: string;
  plantationCode: string;
  plantationName: string;
  areaHectares: number;
  corners: PlantationCoordinate[];
  assignedForemanIds?: string[];
  assignedDriverIds?: string[];
};

export type PlantationPayload = {
  plantationCode: string;
  plantationName: string;
  areaHectares: number;
  corners: PlantationCoordinate[];
  assignedForemanIds?: string[];
  assignedDriverIds?: string[];
};
