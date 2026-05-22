'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { getDeliveriesByForeman } from '../mockData';
import { useDeliveryFilters } from '../hooks/useDeliveryFilters';
import { DeliveryCard } from '../components/DeliveryCard';
import type { Delivery } from '../types';
import Link from 'next/link';

export function ForemanDeliveriesPage() {
  // Mock foreman ID - in real app, get from auth context
  const foremanId = 'foreman-001';
  const deliveries = getDeliveriesByForeman(foremanId);
  const { filteredDeliveries, searchTerm, setSearchTerm, filters, setFilters } =
    useDeliveryFilters(deliveries as Delivery[]);

  return (
    <div className="min-h-screen bg-[#FFFFF1]">
      {/* Header */}
      <div className="bg-white border-b border-[#DADAD3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-[#1A1C18]">Deliveries</h1>
          <p className="text-gray-600 mt-1">Manage and approve delivery of harvested palm oil</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DADAD3] p-6 mb-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#1A1C18] mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Driver, laborer name..."
                className="w-full px-4 py-2 border border-[#DADAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415B2B]"
              />
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-[#1A1C18] mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: (e.target.value as any) || undefined,
                  })
                }
                className="w-full px-4 py-2 border border-[#DADAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415B2B]"
              >
                <option value="">All Status</option>
                <option value="Loading">Loading</option>
                <option value="Transporting">In Transit</option>
                <option value="Arrived">Arrived</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-[#1A1C18] mb-2">
                Approval
              </label>
              <select
                value={filters.approvalStatus || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    approvalStatus: (e.target.value as any) || undefined,
                  })
                }
                className="w-full px-4 py-2 border border-[#DADAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415B2B]"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deliveries Grid */}
        {filteredDeliveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDeliveries.map((delivery: Delivery) => (
              <Link
                key={delivery.id}
                href={`/transport/foreman/deliveries/${delivery.id}`}
              >
                <DeliveryCard delivery={delivery} showActions={true} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-[#DADAD3]">
            <Eye size={48} className="mx-auto text-[#DADAD3] mb-4" />
            <h3 className="text-lg font-medium text-[#1A1C18] mb-2">No deliveries found</h3>
            <p className="text-gray-600">
              Adjust your filters to see deliveries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForemanDeliveriesPage;
