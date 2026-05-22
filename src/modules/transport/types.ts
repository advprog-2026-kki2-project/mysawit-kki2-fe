// Transport Module Types

export type DeliveryStatus = 'Loading' | 'Transporting' | 'Arrived' | 'Approved' | 'Rejected' | 'Pending';

export type DeliveryApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'PartiallyApproved';

export interface HarvestItem {
  id: string;
  laborerId: string;
  laborerName: string;
  weight: number; // in kg
  harvestDate: string;
  location: string;
}

export interface Delivery {
  id: string;
  plantationId: string;
  plantationName: string;
  driverId: string;
  driverName: string;
  foremanId: string;
  foremanName: string;
  status: DeliveryStatus;
  approvalStatus: DeliveryApprovalStatus;
  harvestItems: HarvestItem[];
  totalWeight: number; // in kg
  createdAt: string;
  updatedAt: string;
  arrivedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface DeliveryApprovalPayload {
  deliveryId: string;
  approved: boolean;
  reason?: string;
  recognizedWeight?: number;
}

export interface DeliveryStatusUpdate {
  deliveryId: string;
  status: DeliveryStatus;
  timestamp: string;
}

export interface DeliveryFilter {
  plantationId?: string;
  foremanId?: string;
  driverId?: string;
  status?: DeliveryStatus;
  approvalStatus?: DeliveryApprovalStatus;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}
