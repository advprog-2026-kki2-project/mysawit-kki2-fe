'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDeliveryById } from '../mockData';
import { getTransportById } from '../data/transport-api';
import { StatusTimeline } from '../components/StatusTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { RejectModal } from '../components/RejectModal';
import { formatDate } from '../deliveryUtils';
import type { Delivery, HarvestItem } from '../types';
import Link from 'next/link';

export function AdminDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id as string;

  const [delivery, setDelivery] = useState<Delivery>(() =>
    getDeliveryById(deliveryId) as Delivery,
  );
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPartialReject, setIsPartialReject] = useState(false);
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
            href="/transport/admin/deliveries"
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
          <Link href="/transport/admin/deliveries" className="text-[#415B2B] hover:underline">
            Back to deliveries
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      console.log('Admin approving delivery:', deliveryId);
      setTimeout(() => {
        alert('Delivery approved successfully! Foreman will receive payroll.');
        router.push('/transport/admin/deliveries');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setIsLoading(true);
    try {
      console.log('Admin rejecting delivery:', deliveryId, reason);
      setTimeout(() => {
        alert(`Delivery rejected: ${reason}`);
        router.push('/transport/admin/deliveries');
      }, 1000);
    } finally {
      setIsRejectModalOpen(false);
      setIsLoading(false);
    }
  };

  const handlePartialReject = async (reason: string, recognizedWeight?: number) => {
    setIsLoading(true);
    try {
      console.log('Admin partially rejecting delivery:', deliveryId, reason, recognizedWeight);
      setTimeout(() => {
        alert(
          `Delivery partially rejected: ${reason}\nRecognized: ${recognizedWeight} kg\nForeman receives partial payroll.`
        );
        router.push('/transport/admin/deliveries');
      }, 1000);
    } finally {
      setIsRejectModalOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFF1]">
      {/* Header */}
      <div className="bg-white border-b border-[#DADAD3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/transport/admin/deliveries">
            <ArrowLeft size={24} className="text-[#1A1C18] cursor-pointer hover:text-[#415B2B]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1A1C18]">
              Delivery #{delivery.id.split('-')[1]}
            </h1>
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
                <h2 className="text-xl font-semibold text-[#1A1C18]">Delivery Overview</h2>
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

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Driver</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.driverName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Foreman</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.foremanName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Total Weight</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.totalWeight} kg</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Capacity Usage</label>
                  <p className="font-medium text-[#1A1C18]">
                    {Math.round((delivery.totalWeight / 400) * 100)}%
                  </p>
                </div>
              </div>

              <div className="border-t border-[#DADAD3] pt-4">
                <p className="text-sm text-gray-600 mb-2">Created: {formatDate(delivery.createdAt)}</p>
                {delivery.arrivedAt && (
                  <p className="text-sm text-gray-600">Arrived: {formatDate(delivery.arrivedAt)}</p>
                )}
              </div>
            </div>

            {/* Foreman Review Summary */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Foreman Review</h3>
              <StatusBadge
                status={
                  delivery.approvalStatus === 'Approved'
                    ? 'approved'
                    : delivery.approvalStatus === 'Rejected'
                      ? 'rejected'
                      : 'pending'
                }
                className="mb-4"
              />

              {delivery.approvalStatus === 'Rejected' && delivery.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-sm font-medium text-red-700 mb-2">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{delivery.rejectionReason}</p>
                </div>
              )}

              {delivery.approvedAt && (
                <p className="text-sm text-gray-600 mt-4">
                  Approved on {formatDate(delivery.approvedAt)}
                </p>
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
            {/* Admin Approval Section */}
            {delivery.approvalStatus === 'Pending' && delivery.status === 'Arrived' && (
              <div className="bg-white rounded-lg border-2 border-[#415B2B] p-6">
                <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Factory Verification</h3>
                <p className="text-sm text-gray-600 mb-6">
                  This delivery has been reviewed by the foreman and is awaiting factory verification.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-[#80B048] text-white rounded-lg font-medium hover:bg-[#6fa03a] disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Processing...' : '✓ Approve Delivery'}
                  </button>

                  <button
                    onClick={() => {
                      setIsPartialReject(false);
                      setIsRejectModalOpen(true);
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    ✗ Full Rejection
                  </button>

                  <button
                    onClick={() => {
                      setIsPartialReject(true);
                      setIsRejectModalOpen(true);
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-orange-500 text-orange-600 rounded-lg font-medium hover:bg-orange-50 disabled:opacity-50 transition-colors"
                  >
                    ⚠ Partial Rejection
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-[#DADAD3] text-xs text-gray-500 space-y-2">
                  <p>
                    • <strong>Approve:</strong> Recognizes all items, foreman gets full payroll
                  </p>
                  <p>
                    • <strong>Full Reject:</strong> Delivery fails inspection, no payroll
                  </p>
                  <p>
                    • <strong>Partial Reject:</strong> Some items accepted, foreman gets partial payroll
                  </p>
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Delivery Status</p>
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
                <div>
                  <p className="text-sm text-gray-600 mt-4">Admin Review</p>
                  <StatusBadge
                    status={
                      delivery.approvalStatus === 'Approved'
                        ? 'approved'
                        : delivery.approvalStatus === 'Rejected'
                          ? 'rejected'
                          : 'pending'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            {delivery.notes && (
              <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
                <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Notes</h3>
                <p className="text-sm text-[#1A1C18]">{delivery.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={isPartialReject ? handlePartialReject : handleReject}
        isPartialRejection={isPartialReject}
        maxWeight={delivery.totalWeight}
        title={isPartialReject ? 'Partial Rejection' : 'Reject Delivery'}
        description={
          isPartialReject
            ? 'Specify how much weight was recognized and provide a reason for the rejection.'
            : 'Provide a reason for rejecting this delivery.'
        }
      />
    </div>
  );
}

export default AdminDeliveryDetailPage;
