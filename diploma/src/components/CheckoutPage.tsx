'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import useFetchClientSecret from '../../hooks/useFetchClientSecret';

interface CheckoutPageProps {
  amount: number;
  onPaymentSuccess: () => void;
}

const CheckoutPage = ({ amount, onPaymentSuccess }: CheckoutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPaymentCompleted, setHasPaymentCompleted] = useState(false);
  const { useClientSecret: fetchedClientSecret, useErrorMessage: fetchedErrorMessage } = useFetchClientSecret({
    amount,
  });

  useEffect(() => {
    if (fetchedClientSecret) {
      setClientSecret(fetchedClientSecret);
    }
    if (fetchedErrorMessage) {
      setErrorMessage(fetchedErrorMessage);
    }
  }, [fetchedClientSecret]);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(undefined);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setIsSubmitting(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.origin },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
    } else if (paymentIntent?.status === 'succeeded') {
      setHasPaymentCompleted(true);
      onPaymentSuccess();
    }

    setIsSubmitting(false);
  };

  if (hasPaymentCompleted) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Payment Successful!</strong>
        <span className="block sm:inline"> Thank you for your purchase of ${amount}.</span>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading payment interface...
          </span>
        </div>
        {errorMessage && <div className="ml-2 text-red-500">{errorMessage}</div>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      <PaymentElement />

      {errorMessage && <div className="text-red-500 mt-2 ml-1">{errorMessage}</div>}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="text-white w-full p-3 bg-black mt-4 rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!isSubmitting ? `Pay $${amount}` : 'Processing Payment...'}
      </button>
    </form>
  );
};

export default CheckoutPage;
