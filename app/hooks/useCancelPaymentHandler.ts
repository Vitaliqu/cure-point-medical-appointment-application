import { useCallback } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/../backend/lib/firebaseConfig';
import { Appointment, PaymentHandlerProps, PaymentData } from '@/interfaces/interfaces';

const useCancelPaymentHandler = ({ currentUser, router, onError, onSuccess, setPayments }: PaymentHandlerProps) => {
  return useCallback(
    async (appointment: Appointment) => {
      if (!currentUser) return;

      try {
        const paymentRef = doc(db, 'payments', appointment.id);
        const paymentSnapshot = await getDoc(paymentRef);

        if (paymentSnapshot.exists()) {
          const paymentData = paymentSnapshot.data() as PaymentData;

          if (paymentData?.status === 'paid') {
            onError('Cannot delete a paid payment record.');
            return;
          }
        } else {
          onError('Payment record does not exist');
          return;
        }

        if (currentUser.uid !== appointment.doctorId) {
          onError('Only the doctor can delete the payment record');
          return;
        }

        await deleteDoc(paymentRef);

        setPayments((prev: PaymentData[]) => prev.filter((payment) => payment.appointmentId !== appointment.id));

        onSuccess('Payment record deleted successfully!');
      } catch (error) {
        console.error('Payment record deleting error:', error);
        onError('Failed to delete payment record.');
      }
    },
    [currentUser, onError, router, onSuccess, setPayments],
  );
};

export default useCancelPaymentHandler;
