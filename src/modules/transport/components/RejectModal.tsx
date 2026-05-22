'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, recognizedWeight?: number) => void;
  isPartialRejection?: boolean;
  maxWeight?: number;
  title?: string;
  description?: string;
}

export function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  isPartialRejection,
  maxWeight,
  title = 'Reject Delivery',
  description = 'Provide a reason for rejection.',
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [recognizedWeight, setRecognizedWeight] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (isPartialRejection && recognizedWeight === undefined) {
      alert('Please specify the recognized weight');
      return;
    }

    setIsLoading(true);
    try {
      onConfirm(reason, recognizedWeight);
      setReason('');
      setRecognizedWeight(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-[#DADAD3]">
          <h2 className="text-lg font-semibold text-[#1A1C18]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">{description}</p>

          <div>
            <label className="block text-sm font-medium text-[#1A1C18] mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this delivery is being rejected..."
              className="w-full p-3 border border-[#DADAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415B2B]"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {isPartialRejection && (
            <div>
              <label className="block text-sm font-medium text-[#1A1C18] mb-2">
                Recognized Weight (kg) *
              </label>
              <input
                type="number"
                value={recognizedWeight || ''}
                onChange={(e) => setRecognizedWeight(Number(e.target.value))}
                placeholder="Enter weight accepted by factory"
                max={maxWeight}
                className="w-full p-3 border border-[#DADAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415B2B]"
                disabled={isLoading}
              />
              {maxWeight && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {maxWeight} kg
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-[#DADAD3] text-[#1A1C18] rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
