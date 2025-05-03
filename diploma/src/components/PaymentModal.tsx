import React, { memo } from 'react';
interface PaymentModalProps {
  isEditing: boolean;
  amount: number;
  onAmountChange: (amount: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}
const PaymentModal: React.FC<PaymentModalProps> = ({ isEditing, amount, onAmountChange, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Edit Payment Amount' : 'Set Payment Amount'}
        </h2>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
              $
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              value={amount}
              onChange={(e) => onAmountChange(Number(e.target.value))}
              min={0}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
              USD
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
export default memo(PaymentModal);
