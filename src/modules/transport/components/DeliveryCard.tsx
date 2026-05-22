'use client';

import { Delivery } from '../types';
import { formatDate, getStatusLabel } from '../deliveryUtils';
import { StatusBadge } from './StatusBadge';

interface DeliveryCardProps {
  delivery: Delivery;
  onClick?: () => void;
  showActions?: boolean;
}

export function DeliveryCard({ delivery, onClick, showActions }: DeliveryCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#DADAD3] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#1A1C18]">
            Delivery #{delivery.id.split('-')[1]}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{delivery.plantationName}</p>
        </div>
        <StatusBadge status={delivery.status as any} />
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Driver:</span>
          <span className="font-medium text-[#1A1C18]">{delivery.driverName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Foreman:</span>
          <span className="font-medium text-[#1A1C18]">{delivery.foremanName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Weight:</span>
          <span className="font-medium text-[#1A1C18]">{delivery.totalWeight} kg</span>
        </div>
      </div>

      <div className="border-t border-[#DADAD3] pt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">{formatDate(delivery.createdAt)}</span>
        {showActions && (
          <div className="flex gap-2">
            {delivery.status === 'Arrived' && delivery.approvalStatus === 'Pending' && (
              <span className="px-3 py-1 bg-[#415B2B]/10 text-[#415B2B] text-xs font-medium rounded">
                Awaiting Approval
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
