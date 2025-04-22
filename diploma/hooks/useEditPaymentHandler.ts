import { useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/../backend/lib/firebaseConfig';
import { Appointment, PaymentHandlerProps, PaymentData } from '@/interfaces/interfaces';

const useEditPaymentHandler = ({
  currentUser,
  paymentAmount,
  router,
  onError,
  onSuccess,
  setPayments,
}: PaymentHandlerProps) => {
  return useCallback(
    async (appointment: Appointment) => {
      if (!currentUser) return;

      try {
        const paymentRef = doc(db, 'payments', appointment.id);
        const paymentSnapshot = await getDoc(paymentRef);

        if (currentUser.uid !== appointment.doctorId) {
          onError('Only doctor can edit payment amount');
          return;
        }

        if (!paymentSnapshot.exists()) {
          onError('Payment record does not exist');
          return;
        }

        await updateDoc(paymentRef, {
          amount: paymentAmount,
        });

        setPayments((prev) =>
          prev.map((payment) =>
            payment.appointmentId === appointment.id ? { ...payment, amount: paymentAmount } : payment,
          ),
        );

        onSuccess('Payment updated successfully!');
      } catch (error) {
        console.error('Payment update error:', error);
        onError('Failed to update payment record.');
      }
    },
    [currentUser, paymentAmount, router, onError, onSuccess, setPayments],
  );
};

export default useEditPaymentHandler;
