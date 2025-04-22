import { Dispatch, SetStateAction, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/../backend/lib/firebaseConfig';
import { Appointment, PaymentHandlerProps, PaymentData, UserType } from '@/interfaces/interfaces';
import { useRouter } from 'next/navigation';

const usePaymentSuccess = ({
  currentUser,
  router,
  setPayments,
}: {
  currentUser: UserType;
  router: ReturnType<typeof useRouter>;
  setPayments: Dispatch<SetStateAction<PaymentData[]>>;
}) => {
  return useCallback(
    async (appointment: Appointment) => {
      if (!currentUser) return;

      try {
        const paymentRef = doc(db, 'payments', appointment.id);
        // Optional: Fetch the document to ensure it exists or get other data
        const paymentSnap = await getDoc(paymentRef);
        if (!paymentSnap.exists()) {
          console.error(`Payment document with ID ${appointment.id} not found.`);
          return; // Or throw an error
        }

        await updateDoc(paymentRef, {
          status: 'paid',
        });

        setPayments((prev) =>
          prev.map((payment) => (payment.appointmentId === appointment.id ? { ...payment, status: 'paid' } : payment)),
        );
      } catch (error) {
        console.error('Payment update error:', error);
      }
    },
    [currentUser, router, setPayments],
  );
};

export default usePaymentSuccess;
