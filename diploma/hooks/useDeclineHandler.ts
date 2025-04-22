import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { db } from '@/../backend/lib/firebaseConfig';
import { Appointment, UserType } from '@/interfaces/interfaces';
import { format } from 'date-fns';

type DeclineHandlerProps = {
  appointmentsToRender: Appointment[];
  currentUser: UserType | null;
  setActiveAppointments: Dispatch<SetStateAction<Appointment[]>>;
  setPastAppointments: Dispatch<SetStateAction<Appointment[]>>;
};

const useDeclineHandler = ({
  appointmentsToRender,
  currentUser,
  setActiveAppointments,
  setPastAppointments,
}: DeclineHandlerProps) => {
  return useCallback(
    async (appointmentId: string, appointmentDate: Date) => {
      try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentData = appointmentsToRender.find((appt) => appt.id === appointmentId);

        if (appointmentData && currentUser) {
          const doctorRef = doc(db, 'users', appointmentData.doctorId);
          const doctorSnap = await getDoc(doctorRef);
          const doctorData = doctorSnap.data() as UserType;

          const appointmentTimeString = format(appointmentDate, 'HH:mm');
          const appointmentDateString = format(appointmentDate, 'yyyy-MM-dd');

          const updatedAvailableSlots =
            doctorData?.availableSlots?.map((slot) => {
              if (slot.date === appointmentDateString) {
                return { ...slot, time: [...(slot.time || []), appointmentTimeString].sort() };
              }
              return slot;
            }) || [];

          if (!doctorData?.availableSlots?.some((slot) => slot.date === appointmentDateString)) {
            updatedAvailableSlots.push({ date: appointmentDateString, time: [appointmentTimeString] });
          }

          await updateDoc(doctorRef, { availableSlots: updatedAvailableSlots });
        }

        await updateDoc(appointmentRef, { status: 'declined' });
        setActiveAppointments((prevAppointments) =>
          prevAppointments.map((appt) => (appt.id === appointmentId ? { ...appt, status: 'declined' } : appt)),
        );
        setPastAppointments((prevAppointments) =>
          prevAppointments.map((appt) => (appt.id === appointmentId ? { ...appt, status: 'declined' } : appt)),
        );
      } catch (error) {
        console.error('Error declining appointment:', error);
      }
    },
    [appointmentsToRender, currentUser, setActiveAppointments, setPastAppointments],
  );
};

export default useDeclineHandler;
