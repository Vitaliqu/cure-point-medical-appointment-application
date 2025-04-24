'use client';

import CheckoutPage from '@/components/CheckoutPage';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FC, useState } from 'react';
import convertToSubcurrency from '@/functions/convertToSubcurrency';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
if (!stripePublicKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
}

const stripePromise = loadStripe(stripePublicKey);

interface StripePaymentProps {
  amount: number;
  setIsPaymentModalOpen: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

interface PaymentConfirmationProps {
  amount: number;
  onClose: () => void;
}

const PaymentConfirmation: FC<PaymentConfirmationProps> = ({ amount, onClose }) => (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-md shadow-lg text-center max-w-md w-full">
      <h2 className="text-xl font-bold text-green-500 mb-3 sm:text-2xl">Payment Successful!</h2>
      <p className="mb-3 text-sm sm:text-base">Your payment of ${amount} has been processed successfully.</p>
      <button
        onClick={onClose}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base"
      >
        Close
      </button>
    </div>
  </div>
);

const StripePayment: FC<StripePaymentProps> = ({ amount, setIsPaymentModalOpen, onPaymentSuccess }) => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSuccessfulPayment = () => {
    setPaymentSuccess(true);
    onPaymentSuccess();
  };

  const handleCloseConfirmation = () => {
    setPaymentSuccess(false);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gradient-to-tr from-blue-500 to-purple-500 rounded-md overflow-scroll  shadow-lg relative max-w-md w-full m-4 p-6 sm:p-8 max-h-[90vh]">
        <button
          className="absolute top-2 right-3 text-white hover:text-red-300 text-3xl focus:outline-none"
          onClick={() => setIsPaymentModalOpen(false)}
          aria-label="Close payment modal"
        >
          &times;
        </button>
        <div className="mb-4 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Your total is <span className="font-bold">${amount}</span>
          </h2>
        </div>
        <Elements
          stripe={stripePromise}
          options={{
            mode: 'payment',
            amount: convertToSubcurrency(amount),
            currency: 'usd',
          }}
        >
          <CheckoutPage amount={amount} onPaymentSuccess={handleSuccessfulPayment} />
        </Elements>
        {paymentSuccess && <PaymentConfirmation amount={amount} onClose={handleCloseConfirmation} />}
      </div>
    </div>
  );
};

export default StripePayment;
