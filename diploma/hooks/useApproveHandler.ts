import { doc, updateDoc } from 'firebase/firestore';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { db } from '@/../backend/lib/firebaseConfig';
import { Appointment } from '@/interfaces/interfaces';

type ApproveHandlerProps = {
  setActiveAppointments: Dispatch<SetStateAction<Appointment[]>>;
  setPastAppointments: Dispatch<SetStateAction<Appointment[]>>;
};

const useApproveHandler = ({ setActiveAppointments, setPastAppointments }: ApproveHandlerProps) => {
  return useCallback(
    async (appointmentId: string) => {
      try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        await updateDoc(appointmentRef, { status: 'approved' });
        setActiveAppointments((prevAppointments) =>
          prevAppointments.map((appt) => (appt.id === appointmentId ? { ...appt, status: 'approved' } : appt)),
        );
        setPastAppointments((prevAppointments) =>
          prevAppointments.map((appt) => (appt.id === appointmentId ? { ...appt, status: 'approved' } : appt)),
        );
      } catch (error) {
        console.error('Error approving appointment:', error);
      }
    },
    [setActiveAppointments, setPastAppointments],
  );
};

export default useApproveHandler;
