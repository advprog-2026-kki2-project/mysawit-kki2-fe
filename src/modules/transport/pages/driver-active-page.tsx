'use client';

import { useState, useEffect } from 'react';
import { getDeliveriesByDriver } from '../mockData';
import { getDriverDeliveries } from '../data/transport-api';
import { useDeliveryFilters } from '../hooks/useDeliveryFilters';
import { DeliveryCard } from '../components/DeliveryCard';
import { isDeliveryInTransit } from '../deliveryUtils';
import type { Delivery } from '../types';
import Link from 'next/link';

export function DriverActiveDeliveriesPage() {
  // Mock driver ID - in real app, get from auth context
  const driverId = 'driver-001';
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>(() => getDeliveriesByDriver(driverId) as Delivery[]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getDriverDeliveries(driverId);
        if (!mounted) return;
        setAllDeliveries(res as unknown as Delivery[]);
      } catch (err) {
        console.warn('Driver deliveries API failed, using mock data', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [driverId]);

  // Separate active from completed
  const activeDeliveries = allDeliveries.filter(
    (d: Delivery) => d.status === 'Loading' || d.status === 'Transporting'
  );
  const completedDeliveries = allDeliveries.filter(
    (d: Delivery) => d.status === 'Arrived' || d.approvalStatus === 'Approved' || d.approvalStatus === 'Rejected'
  );

  return (
    <div className="min-h-screen bg-[#FFFFF1]">
      {/* Header */}
      <div className="bg-white border-b border-[#DADAD3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-[#1A1C18]">My Deliveries</h1>
          <p className="text-gray-600 mt-1">Track and manage your active deliveries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Active Deliveries Section */}
        {activeDeliveries.length > 0 && (
          <div className="mb-12">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-[#1A1C18] flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#774E15] rounded-full"></span>
                Active Deliveries
              </h2>
              <p className="text-gray-600 mt-1">
                {activeDeliveries.length} deliveries in progress
              </p>
            </div>

            <div className="space-y-4">
              {activeDeliveries.map((delivery: Delivery) => (
                <Link
                  key={delivery.id}
                  href={`/transport/driver/deliveries/${delivery.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg border-2 border-[#774E15] p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1C18]">
                          Delivery #{delivery.id.split('-')[1]}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{delivery.plantationName}</p>
                      </div>
                      <span className="px-3 py-1 bg-[#774E15]/20 text-[#774E15] text-sm font-medium rounded-full">
                        {delivery.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Foreman</span>
                        <p className="font-medium text-[#1A1C18]">{delivery.foremanName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Weight</span>
                        <p className="font-medium text-[#1A1C18]">{delivery.totalWeight} kg</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600">Items</span>
                        <p className="font-medium text-[#1A1C18]">{delivery.harvestItems.length}</p>
                      </div>
                    </div>

                    <div className="border-t border-[#DADAD3] pt-4">
                      <button className="text-[#415B2B] font-medium text-sm hover:underline">
                        View Details & Update Status →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Deliveries Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-[#1A1C18]">History</h2>
            <p className="text-gray-600 mt-1">
              {completedDeliveries.length} completed deliveries
            </p>
          </div>

          {completedDeliveries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedDeliveries.map((delivery: Delivery) => (
                <Link
                  key={delivery.id}
                  href={`/transport/driver/deliveries/${delivery.id}`}
                  className="block"
                >
                  <DeliveryCard delivery={delivery} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-[#DADAD3]">
              <p className="text-gray-600">No completed deliveries yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DriverActiveDeliveriesPage;

// Provide legacy named export expected by some route wrappers
export const DriverActivePage = DriverActiveDeliveriesPage;
