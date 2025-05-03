import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../backend/lib/firebaseConfig';
import fetchAppointments from '@/app/api/fetchAppointments';
import { UseFinishAppointmentProps } from '@/interfaces/interfaces';

const useFinishAppointment = ({
  currentUser,
  selectedDate,
  setPayments,
  setActiveAppointments,
  setPastAppointments,
  setLoading,
  setPaymentSuccess,
  setPaymentError,
}: UseFinishAppointmentProps) => {
  return async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'finished' });

      if (currentUser && selectedDate) {
        fetchAppointments({
          currentUser,
          selectedDate,
          setPayments,
          setActiveAppointments,
          setPastAppointments,
          setLoading,
        });
      }
      setActiveAppointments((prevAppointments) =>
        prevAppointments.map((appt) => (appt.id === appointmentId ? { ...appt, status: 'finished' } : appt)),
      );
      setPaymentSuccess('Appointment finished successfully!');
      setTimeout(() => setPaymentSuccess(null), 3000);
    } catch (err: unknown) {
      console.error('Error finishing appointment:', err);
      setPaymentError(`Failed to finish appointment! ${err}`);
      setTimeout(() => setPaymentError(null), 3000);
    }
  };
};

export default useFinishAppointment;
