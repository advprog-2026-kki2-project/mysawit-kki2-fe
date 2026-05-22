// Mock data for transport module development

import { Delivery, HarvestItem } from './types';

const mockHarvestItems: HarvestItem[] = [
  {
    id: 'harvest-001',
    laborerId: 'lab-001',
    laborerName: 'Ahmad Santoso',
    weight: 125,
    harvestDate: '2026-05-22',
    location: 'Block A1',
  },
  {
    id: 'harvest-002',
    laborerId: 'lab-002',
    laborerName: 'Budi Hermawan',
    weight: 98,
    harvestDate: '2026-05-22',
    location: 'Block A2',
  },
  {
    id: 'harvest-003',
    laborerId: 'lab-003',
    laborerName: 'Citra Dewi',
    weight: 150,
    harvestDate: '2026-05-22',
    location: 'Block B1',
  },
];

export const mockDeliveries: Delivery[] = [
  {
    id: 'delivery-001',
    plantationId: 'plant-001',
    plantationName: 'Sawit Jaya Plantation',
    driverId: 'driver-001',
    driverName: 'Rinto Harahap',
    foremanId: 'foreman-001',
    foremanName: 'Syaiful Rahman',
    status: 'Arrived',
    approvalStatus: 'Pending',
    harvestItems: mockHarvestItems.slice(0, 2),
    totalWeight: 223,
    createdAt: '2026-05-22T08:30:00Z',
    updatedAt: '2026-05-22T12:45:00Z',
    arrivedAt: '2026-05-22T12:45:00Z',
    notes: 'All items inspected and ready for processing',
  },
  {
    id: 'delivery-002',
    plantationId: 'plant-001',
    plantationName: 'Sawit Jaya Plantation',
    driverId: 'driver-002',
    driverName: 'Anggit Wijaya',
    foremanId: 'foreman-001',
    foremanName: 'Syaiful Rahman',
    status: 'Transporting',
    approvalStatus: 'Pending',
    harvestItems: mockHarvestItems.slice(2, 3),
    totalWeight: 150,
    createdAt: '2026-05-22T09:15:00Z',
    updatedAt: '2026-05-22T11:00:00Z',
    notes: 'En route to processing plant',
  },
  {
    id: 'delivery-003',
    plantationId: 'plant-001',
    plantationName: 'Sawit Jaya Plantation',
    driverId: 'driver-001',
    driverName: 'Rinto Harahap',
    foremanId: 'foreman-001',
    foremanName: 'Syaiful Rahman',
    status: 'Approved',
    approvalStatus: 'Approved',
    harvestItems: [
      {
        id: 'harvest-004',
        laborerId: 'lab-004',
        laborerName: 'Desi Ratnawati',
        weight: 180,
        harvestDate: '2026-05-21',
        location: 'Block C1',
      },
    ],
    totalWeight: 180,
    createdAt: '2026-05-21T07:00:00Z',
    updatedAt: '2026-05-21T16:30:00Z',
    approvedAt: '2026-05-21T16:30:00Z',
  },
  {
    id: 'delivery-004',
    plantationId: 'plant-001',
    plantationName: 'Sawit Jaya Plantation',
    driverId: 'driver-003',
    driverName: 'Bambang Suryanto',
    foremanId: 'foreman-001',
    foremanName: 'Syaiful Rahman',
    status: 'Rejected',
    approvalStatus: 'Rejected',
    harvestItems: [
      {
        id: 'harvest-005',
        laborerId: 'lab-005',
        laborerName: 'Eka Putri',
        weight: 95,
        harvestDate: '2026-05-21',
        location: 'Block D1',
      },
    ],
    totalWeight: 95,
    createdAt: '2026-05-21T10:00:00Z',
    updatedAt: '2026-05-21T14:20:00Z',
    rejectionReason: 'Visible damage to palm fruits, suspected contamination during transport',
  },
];

export const getDeliveriesByForeman = (foremanId: string): Delivery[] => {
  return mockDeliveries.filter((d) => d.foremanId === foremanId);
};

export const getDeliveriesByDriver = (driverId: string): Delivery[] => {
  return mockDeliveries.filter((d) => d.driverId === driverId);
};

export const getDeliveriesByStatus = (status: string): Delivery[] => {
  return mockDeliveries.filter((d) => d.status === status);
};

export const getApprovedDeliveries = (): Delivery[] => {
  return mockDeliveries.filter((d) => d.approvalStatus === 'Approved');
};

export const getDeliveryById = (id: string): Delivery | undefined => {
  return mockDeliveries.find((d) => d.id === id);
};
