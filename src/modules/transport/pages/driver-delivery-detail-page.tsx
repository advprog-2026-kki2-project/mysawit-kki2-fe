'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDeliveryById } from '../mockData';
import { getTransportById, updateTransportStatus } from '../data/transport-api';
import { StatusTimeline } from '../components/StatusTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, isDeliveryInTransit } from '../deliveryUtils';
import type { Delivery, HarvestItem } from '../types';
import Link from 'next/link';

export function DriverDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id as string;

  const [delivery, setDelivery] = useState<Delivery>(() => getDeliveryById(deliveryId) as Delivery);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Delivery['status']>(delivery.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const t = await getTransportById(deliveryId);
        if (!mounted) return;
        setDelivery(t as unknown as Delivery);
        setSelectedStatus((t as unknown as Delivery).status ?? delivery.status);
      } catch (err) {
        const fallback = getDeliveryById(deliveryId);
        if (!fallback) setError('Failed to load delivery from server.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [deliveryId]);

  if (!delivery && !isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFFF1] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1C18] mb-4">Delivery not found</h2>
          <Link
            href="/transport/driver/active"
            className="text-[#415B2B] hover:underline"
          >
            Back to deliveries
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFFF1] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1C18] mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/transport/driver/active" className="text-[#415B2B] hover:underline">
            Back to deliveries
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: Delivery['status']) => {
    setIsUpdating(true);
    try {
      const numeric = parseInt(String(deliveryId).replace(/\D/g, ''), 10);
      if (Number.isNaN(numeric)) {
        // unable to parse numeric id from route, skip API call and update locally
        setSelectedStatus(newStatus);
        setDelivery({ ...delivery, status: newStatus });
      } else {
        const updated = await updateTransportStatus(numeric, newStatus as unknown as import('../data/types').TransportStatus);
        setSelectedStatus((updated as unknown as Delivery).status);
        setDelivery(updated as unknown as Delivery);
      }
      alert(`Delivery status updated to: ${newStatus}`);
    } catch (error) {
      alert('Failed to update status');
      setIsUpdating(false);
    }
  };

  const getNextStatus = (): Delivery['status'] | null => {
    switch (delivery.status) {
      case 'Loading':
        return 'Transporting';
      case 'Transporting':
        return 'Arrived';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <div className="min-h-screen bg-[#FFFFF1]">
      {/* Header */}
      <div className="bg-white border-b border-[#DADAD3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/transport/driver/active">
            <ArrowLeft size={24} className="text-[#1A1C18] cursor-pointer hover:text-[#415B2B]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1A1C18]">Delivery #{delivery.id.split('-')[1]}</h1>
            <p className="text-gray-600 mt-1">{delivery.plantationName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Overview */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-[#1A1C18]">Delivery Details</h2>
                {(() => {
                  const variant =
                    delivery.status === 'Loading'
                      ? 'loading'
                      : delivery.status === 'Transporting'
                      ? 'transporting'
                      : delivery.status === 'Arrived'
                      ? 'arrived'
                      : delivery.approvalStatus === 'Approved'
                      ? 'approved'
                      : delivery.approvalStatus === 'Rejected'
                      ? 'rejected'
                      : 'pending';
                  return <StatusBadge status={variant} />;
                })()}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Foreman</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.foremanName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Status</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.status}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Total Weight</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.totalWeight} kg</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Plantation</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.plantationName}</p>
                </div>
              </div>

              {delivery.notes && (
                <div className="mt-6 pt-6 border-t border-[#DADAD3]">
                  <label className="text-sm text-gray-600 block mb-2">Notes</label>
                  <p className="text-[#1A1C18]">{delivery.notes}</p>
                </div>
              )}
            </div>

            {/* Harvest Items */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">
                Harvest Items ({delivery.harvestItems.length})
              </h3>
              <div className="space-y-3">
                {delivery.harvestItems.map((item: HarvestItem) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-[#FFFFF1] rounded-lg border border-[#DADAD3]"
                  >
                    <div>
                      <p className="font-medium text-[#1A1C18]">{item.laborerName}</p>
                      <p className="text-sm text-gray-600">
                        {item.location} • {item.harvestDate}
                      </p>
                    </div>
                    <span className="font-semibold text-[#415B2B] text-lg">{item.weight} kg</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <StatusTimeline delivery={delivery} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update Section */}
            {nextStatus && (
              <div className="bg-white rounded-lg border border-[#774E15] p-6">
                <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Update Status</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Mark your next action for this delivery.
                </p>

                <button
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 bg-[#774E15] text-white rounded-lg font-medium hover:bg-[#5a3b0f] disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? 'Updating...' : `Mark as ${nextStatus}`}
                </button>

                <div className="mt-4 p-3 bg-[#774E15]/10 rounded-lg">
                  <p className="text-sm text-[#774E15]">
                    Current: <strong>{delivery.status}</strong> → Next: <strong>{nextStatus}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Approval Status */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Foreman Approval</h3>

              {delivery.approvalStatus === 'Pending' && delivery.status === 'Arrived' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                  Awaiting foreman review...
                </div>
              ) : (
                <StatusBadge
                  status={
                    delivery.approvalStatus === 'Approved'
                      ? 'approved'
                      : delivery.approvalStatus === 'Rejected'
                        ? 'rejected'
                        : 'pending'
                  }
                  className="w-full justify-center text-base py-2"
                />
              )}

              {delivery.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {delivery.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Created Date */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Dates</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-[#1A1C18]">{formatDate(delivery.createdAt)}</p>
                </div>
                {delivery.arrivedAt && (
                  <div>
                    <p className="text-gray-600">Arrived</p>
                    <p className="font-medium text-[#1A1C18]">{formatDate(delivery.arrivedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverDeliveryDetailPage;
