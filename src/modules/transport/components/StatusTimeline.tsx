'use client';

import { Delivery, DeliveryStatus } from '../types';
import { formatDate } from '../deliveryUtils';

interface StatusTimelineProps {
  delivery: Delivery;
}

const statusSequence: DeliveryStatus[] = ['Loading', 'Transporting', 'Arrived', 'Approved'];

export function StatusTimeline({ delivery }: StatusTimelineProps) {
  const getStatusTimestamp = (status: DeliveryStatus): string | undefined => {
    switch (status) {
      case 'Loading':
      case 'Transporting':
        return delivery.createdAt;
      case 'Arrived':
        return delivery.arrivedAt;
      case 'Approved':
        return delivery.approvedAt;
      default:
        return undefined;
    }
  };

  const isStatusActive = (status: DeliveryStatus): boolean => {
    const currentStatusIndex = statusSequence.indexOf(delivery.status as DeliveryStatus);
    const statusIndex = statusSequence.indexOf(status);
    return statusIndex <= currentStatusIndex;
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-[#1A1C18]">Delivery Timeline</h4>
      <div className="space-y-3">
        {statusSequence.map((status, index) => {
          const isActive = isStatusActive(status);
          const timestamp = getStatusTimestamp(status);

          return (
            <div key={status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive
                      ? 'bg-[#80B048] text-white'
                      : 'bg-[#DADAD3] text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < statusSequence.length - 1 && (
                  <div
                    className={`w-1 h-8 ${
                      isActive ? 'bg-[#80B048]' : 'bg-[#DADAD3]'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className={`font-medium ${isActive ? 'text-[#1A1C18]' : 'text-gray-400'}`}>
                  {status}
                </p>
                {timestamp && (
                  <p className="text-sm text-gray-500">{formatDate(timestamp)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
