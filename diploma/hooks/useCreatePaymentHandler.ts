import { useCallback } from 'react';
import { doc, setDoc as firebaseSetDoc, getDoc } from 'firebase/firestore';
import { db } from '@/../backend/lib/firebaseConfig';
import { Appointment, PaymentHandlerProps, PaymentData } from '@/interfaces/interfaces';

const useCreatePaymentHandler = ({
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
        const paymentData: PaymentData = {
          appointmentId: appointment.id,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          amount: paymentAmount,
          status: 'pending',
          createdAt: new Date(),
        };
        if (currentUser.uid !== appointment.doctorId) {
          onError('Only doctor can create payment record');
          return;
        }
        if (paymentSnapshot.exists()) {
          onError('Payment record already exists');
        } else {
          await firebaseSetDoc(paymentRef, paymentData);
          onSuccess('Payment record created successfully!');
          setPayments((prev) => [...prev, paymentData]);
        }
      } catch (error) {
        console.error('Payment creation/update error:', error);
        onError('Failed to create or update payment record.');
      }
    },
    [currentUser, paymentAmount, router, onError, onSuccess, setPayments],
  );
};

export default useCreatePaymentHandler;
