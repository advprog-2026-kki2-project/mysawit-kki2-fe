'use client';

import { useState } from 'react';
import { getApprovedDeliveries, mockDeliveries } from '../../mockData';
import { useDeliveryFilters } from '../../hooks/useDeliveryFilters';
import { DeliveryCard } from '../../components/DeliveryCard';
import Link from 'next/link';
import { Calendar, Search } from 'lucide-react';

export default function AdminDeliveriesPage() {
  const deliveries = mockDeliveries; // Admin sees all deliveries
  const { filteredDeliveries, searchTerm, setSearchTerm, filters, setFilters } =
    useDeliveryFilters(deliveries);

  const approvedCount = deliveries.filter((d) => d.approvalStatus === 'Approved').length;
  const rejectedCount = deliveries.filter((d) => d.approvalStatus === 'Rejected').length;
  const pendingCount = deliveries.filter((d) => d.approvalStatus === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#FFFFF1]">
      {/* Header */}
      <div className="bg-white border-b border-[#DADAD3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-[#1A1C18]">Delivery Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all deliveries from plantations to factories</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
            <p className="text-gray-600 text-sm mb-2">Approved</p>
            <p className="text-3xl font-bold text-[#80B048]">{approvedCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
            <p className="text-gray-600 text-sm mb-2">Pending Review</p>
            <p className="text-3xl font-bold text-[#774E15]">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
            <p className="text-gray-600 text-sm mb-2">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DADAD3] p-6 mb-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#1A1C18] mb-2">
                Search Foreman / Driver
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Foreman or driver name..."
                  className="w-full pl-10 pr-4 py-2 border border-[#DADAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415B2B]"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-[#1A1C18] mb-2">
                Approval Status
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

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-[#1A1C18] mb-2">
                Delivery Status
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
                <option value="">All</option>
                <option value="Loading">Loading</option>
                <option value="Transporting">In Transit</option>
                <option value="Arrived">Arrived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        {filteredDeliveries.length > 0 ? (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <Link
                key={delivery.id}
                href={`/transport/admin/deliveries/${delivery.id}`}
                className="block"
              >
                <div className="bg-white rounded-lg border border-[#DADAD3] p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#1A1C18]">
                        Delivery #{delivery.id.split('-')[1]}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {delivery.plantationName} • {delivery.driverName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          delivery.status === 'Arrived'
                            ? 'bg-[#80B048]/20 text-[#80B048]'
                            : 'bg-[#774E15]/20 text-[#774E15]'
                        }`}
                      >
                        {delivery.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          delivery.approvalStatus === 'Approved'
                            ? 'bg-[#80B048]/20 text-[#80B048]'
                            : delivery.approvalStatus === 'Rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {delivery.approvalStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 text-sm mb-4 pb-4 border-b border-[#DADAD3]">
                    <div>
                      <span className="text-gray-600">Foreman</span>
                      <p className="font-medium text-[#1A1C18]">{delivery.foremanName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Driver</span>
                      <p className="font-medium text-[#1A1C18]">{delivery.driverName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Weight</span>
                      <p className="font-medium text-[#1A1C18]">{delivery.totalWeight} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Items</span>
                      <p className="font-medium text-[#1A1C18]">{delivery.harvestItems.length}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600">Created</span>
                      <p className="font-medium text-[#1A1C18]">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {delivery.rejectionReason && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Rejection: {delivery.rejectionReason}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-[#DADAD3]">
            <p className="text-gray-600">No deliveries found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
