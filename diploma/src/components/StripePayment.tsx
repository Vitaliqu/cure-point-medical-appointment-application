'use client';

import CheckoutPage from '@/components/CheckoutPage';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useState } from 'react';

// Ensure Stripe public key is defined
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
if (!stripePublicKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
}

// Initialize Stripe promise outside the component for better performance
const stripePromise = loadStripe(stripePublicKey);

// Utility function to convert amount to subcurrency (e.g., cents)
const convertToSubcurrency = (amount: number, factor: number = 100): number => Math.round(amount * factor);

interface StripePaymentProps {
  amount: number;
  setIsPaymentModalOpen: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

interface PaymentConfirmationProps {
  amount: number;
  onClose: () => void;
}

// Reusable component for displaying payment success message
const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({ amount, onClose }) => (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded-md shadow-lg text-center">
      <h2 className="text-2xl font-bold text-green-500 mb-4">Payment Successful!</h2>
      <p className="mb-4">Your payment of ${amount} has been processed successfully.</p>
      <button
        onClick={onClose}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Close
      </button>
    </div>
  </div>
);

// Main Stripe payment component
const StripePayment: React.FC<StripePaymentProps> = ({ amount, setIsPaymentModalOpen, onPaymentSuccess }) => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handles successful payment and triggers the parent callback
  const handleSuccessfulPayment = () => {
    setPaymentSuccess(true);
    onPaymentSuccess();
  };

  // Handles closing the confirmation modal and optionally the parent modal
  const handleCloseConfirmation = () => {
    setPaymentSuccess(false);
    setIsPaymentModalOpen(false);
  };

  return (
    <main className="relative max-w-4xl w-full mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-blue-500 to-purple-500">
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-white hover:text-red-300 text-4xl font-bold focus:outline-none"
        onClick={() => setIsPaymentModalOpen(false)}
        aria-label="Close payment modal"
      >
        &times;
      </button>

      <div className="mb-8">
        <h2 className="text-2xl">
          Your total is <span className="font-bold">${amount}</span>
        </h2>
      </div>

      {/* Stripe Elements provider */}
      <Elements
        stripe={stripePromise}
        options={{
          mode: 'payment',
          amount: convertToSubcurrency(amount),
          currency: 'usd',
        }}
      >
        {/* Checkout form component */}
        <CheckoutPage amount={amount} onPaymentSuccess={handleSuccessfulPayment} />
      </Elements>

      {/* Conditional rendering of the payment success confirmation */}
      {paymentSuccess && <PaymentConfirmation amount={amount} onClose={handleCloseConfirmation} />}
    </main>
  );
};

export default StripePayment;
