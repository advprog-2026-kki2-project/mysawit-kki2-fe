'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDeliveryById } from '../mockData';
import { StatusTimeline } from '../components/StatusTimeline';
import { RejectModal } from '../components/RejectModal';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, isDeliveryAwaitingApproval } from '../deliveryUtils';
import type { Delivery, HarvestItem } from '../types';
import Link from 'next/link';

export function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id as string;

  const delivery = getDeliveryById(deliveryId);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!delivery) {
    return (
      <div className="min-h-screen bg-[#FFFFF1] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1C18] mb-4">Delivery not found</h2>
          <Link
            href="/transport/foreman/deliveries"
            className="text-[#415B2B] hover:underline"
          >
            Back to deliveries
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      console.log('Approving delivery:', deliveryId);
      // In real app, call API here
      setTimeout(() => {
        alert('Delivery approved successfully!');
        router.push('/transport/foreman/deliveries');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setIsLoading(true);
    try {
      console.log('Rejecting delivery:', deliveryId, reason);
      // In real app, call API here
      setTimeout(() => {
        alert(`Delivery rejected: ${reason}`);
        router.push('/transport/foreman/deliveries');
      }, 1000);
    } finally {
      setIsRejectModalOpen(false);
      setIsLoading(false);
    }
  };

  const handlePartialReject = async (reason: string, recognizedWeight?: number) => {
    setIsLoading(true);
    try {
      console.log('Partially rejecting delivery:', deliveryId, reason, recognizedWeight);
      // In real app, call API here
      setTimeout(() => {
        alert(
          `Delivery partially rejected: ${reason}\nRecognized: ${recognizedWeight} kg`
        );
        router.push('/transport/foreman/deliveries');
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
          <Link href="/transport/foreman/deliveries">
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
                <StatusBadge status={delivery.status as any} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Driver</label>
                  <p className="font-medium text-[#1A1C18]">{delivery.driverName}</p>
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
                  <label className="text-sm text-gray-600 block mb-1">Created</label>
                  <p className="font-medium text-[#1A1C18]">{formatDate(delivery.createdAt)}</p>
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
            {/* Approval Section */}
            {isDeliveryAwaitingApproval(delivery) && (
              <div className="bg-white rounded-lg border border-[#80B048] p-6">
                <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Awaiting Your Approval</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Review the delivery details and approve or reject this shipment.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-[#80B048] text-white rounded-lg font-medium hover:bg-[#6fa03a] disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : '✓ Approve Delivery'}
                  </button>
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-[#DADAD3]">
                  <p className="text-xs text-gray-500">
                    You can also partially reject if some items don't meet standards.
                  </p>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {delivery.approvalStatus === 'Rejected' && delivery.rejectionReason && (
              <div className="bg-red-50 rounded-lg border border-red-300 p-6">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Rejection Reason</h3>
                <p className="text-sm text-red-600">{delivery.rejectionReason}</p>
              </div>
            )}

            {/* Approval Status */}
            <div className="bg-white rounded-lg border border-[#DADAD3] p-6">
              <h3 className="text-lg font-semibold text-[#1A1C18] mb-4">Approval Status</h3>
              <StatusBadge
                status={delivery.approvalStatus === 'Approved' ? 'approved' : delivery.approvalStatus === 'Rejected' ? 'rejected' : 'pending'}
                className="w-full justify-center text-base py-2"
              />
              {delivery.approvedAt && (
                <p className="text-sm text-gray-600 mt-4">
                  Approved on {formatDate(delivery.approvedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Reject Delivery"
        description="Provide a reason for rejecting this delivery."
      />
    </div>
  );
}

export default DeliveryDetailPage;
