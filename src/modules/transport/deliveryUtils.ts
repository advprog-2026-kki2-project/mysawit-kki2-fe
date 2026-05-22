// Utility functions for delivery state management and filtering

import { Delivery, DeliveryStatus, DeliveryFilter } from './types';

export const isDeliveryInTransit = (delivery: Delivery): boolean => {
  return delivery.status === 'Loading' || delivery.status === 'Transporting';
};

export const isDeliveryArrived = (delivery: Delivery): boolean => {
  return delivery.status === 'Arrived';
};

export const isDeliveryAwaitingApproval = (delivery: Delivery): boolean => {
  return delivery.status === 'Arrived' && delivery.approvalStatus === 'Pending';
};

export const isDeliveryApproved = (delivery: Delivery): boolean => {
  return delivery.approvalStatus === 'Approved';
};

export const isDeliveryRejected = (delivery: Delivery): boolean => {
  return delivery.approvalStatus === 'Rejected';
};

export const getStatusColor = (status: DeliveryStatus): string => {
  switch (status) {
    case 'Loading':
    case 'Transporting':
      return '#774E15'; // Earthy Wood
    case 'Arrived':
      return '#80B048'; // Leaf Green
    case 'Approved':
      return '#80B048'; // Leaf Green
    case 'Rejected':
      return '#E63946'; // Red for rejection
    default:
      return '#DADAD3'; // Soft clay
  }
};

export const getStatusLabel = (status: DeliveryStatus): string => {
  const labels: Record<DeliveryStatus, string> = {
    Loading: 'Loading',
    Transporting: 'In Transit',
    Arrived: 'Arrived',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Pending: 'Pending',
  };
  return labels[status] || status;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const filterDeliveries = (deliveries: Delivery[], filter: DeliveryFilter): Delivery[] => {
  return deliveries.filter((delivery) => {
    if (filter.plantationId && delivery.plantationId !== filter.plantationId) return false;
    if (filter.foremanId && delivery.foremanId !== filter.foremanId) return false;
    if (filter.driverId && delivery.driverId !== filter.driverId) return false;
    if (filter.status && delivery.status !== filter.status) return false;
    if (filter.approvalStatus && delivery.approvalStatus !== filter.approvalStatus) return false;

    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      const deliveryDate = new Date(delivery.createdAt);
      if (deliveryDate < startDate) return false;
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      const deliveryDate = new Date(delivery.createdAt);
      if (deliveryDate > endDate) return false;
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      const matchDriver = delivery.driverName.toLowerCase().includes(term);
      const matchForeman = delivery.foremanName.toLowerCase().includes(term);
      const matchLaborer = delivery.harvestItems.some((item) =>
        item.laborerName.toLowerCase().includes(term)
      );
      if (!matchDriver && !matchForeman && !matchLaborer) return false;
    }

    return true;
  });
};

export const sortDeliveriesByDate = (deliveries: Delivery[], ascending = false): Delivery[] => {
  return [...deliveries].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const calculateDeliveryCapacityUsage = (totalWeight: number): number => {
  const maxCapacity = 400;
  return Math.round((totalWeight / maxCapacity) * 100);
};

export const isDeliveryOverCapacity = (totalWeight: number): boolean => {
  return totalWeight > 400;
};
