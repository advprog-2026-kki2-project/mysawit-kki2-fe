import { useState } from 'react';
import { Delivery, DeliveryFilter } from '../types';

export const useDeliveryFilters = (initialDeliveries: Delivery[]) => {
  const [filters, setFilters] = useState<DeliveryFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeliveries = initialDeliveries.filter((delivery) => {
    if (filters.status && delivery.status !== filters.status) return false;
    if (filters.approvalStatus && delivery.approvalStatus !== filters.approvalStatus) return false;
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const deliveryDate = new Date(delivery.createdAt);
      if (deliveryDate < startDate) return false;
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      const deliveryDate = new Date(delivery.createdAt);
      if (deliveryDate > endDate) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchDriver = delivery.driverName.toLowerCase().includes(term);
      const matchForeman = delivery.foremanName.toLowerCase().includes(term);
      const matchLaborer = delivery.harvestItems.some((item) =>
        item.laborerName.toLowerCase().includes(term)
      );
      if (!matchDriver && !matchForeman && !matchLaborer) return false;
    }
    return true;
  });

  return {
    filteredDeliveries,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
  };
};
