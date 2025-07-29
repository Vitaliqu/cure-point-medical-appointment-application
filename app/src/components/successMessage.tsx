// components/SuccessMessage.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SuccessMessageProps {
  orderId?: string;
  onClose?: () => void; // Optional handler to close modal or reset UI
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ orderId, onClose }) => {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('cartItems');
    // You might also trigger API calls or analytics here
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-10 text-center">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Success!</strong>
      </div>
      {orderId && (
        <p className="mt-4">
          Your order ID is: <span className="font-bold">{orderId}</span>
        </p>
      )}
      <p className="mt-4">Thank you for your payment!</p>
      <button
        onClick={onClose || (() => router.back())}
        className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Go back to appointments
      </button>
    </div>
  );
};

export default SuccessMessage;
