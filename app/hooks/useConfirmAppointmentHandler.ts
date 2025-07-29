import { auth, db } from '@/../backend/lib/firebaseConfig';
import { addDoc, collection, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { UserType } from '@/interfaces/interfaces';
import updateDoctorAvailableSlots from './useUpdateDoctorAvailableSlots';
import fetchUserData from '@/app/api/fetchUserData';
import { useCallback } from 'react'; // Import useCallback

const useConfirmAppointment = (
  setErrorMessage: (msg: string | null) => void,
  setSuccessMessage: (msg: string | null) => void,
  setIsConfirming: (value: boolean) => void,
  setUsers: ((callback: (prevUsers: UserType[]) => UserType[]) => void) | null,
  setSelectedDoctor: ((doc: UserType) => void) | null,
) => {
  const confirmAppointmentHandler: (
    appointmentDate: Date | null,
    doctor: UserType,
    slot: {
      date: string;
      time: string;
    } | null,
  ) => Promise<void> = useCallback(
    async (appointmentDate: Date | null, doctor: UserType, slot: { date: string; time: string } | null) => {
      if (!appointmentDate || !doctor || !auth.currentUser || !slot) {
        setErrorMessage('Please select a date and time.');
        return;
      }

      setIsConfirming(true);
      setErrorMessage(null);
      const { date: formattedDate, time: selectedTime } = slot;

      try {
        const doctorData = await fetchUserData(doctor.uid);
        if (!doctorData) {
          setErrorMessage('Error: Doctor data not available. Please try again.');
          setIsConfirming(false);
          return;
        }
        const isSlotAvailable = doctorData.availableSlots?.some(
          (s) => s.date === formattedDate && s.time.includes(selectedTime),
        );

        if (!isSlotAvailable) {
          setErrorMessage('Selected time is no longer available. Please choose another slot.');
          setIsConfirming(false);
          return;
        }

        if (auth.currentUser.uid === doctor.uid) {
          console.error('Doctor can not make appointment with himself');
          return;
        }
        const appointmentData = {
          doctorId: doctor.uid,
          patientId: auth.currentUser.uid,
          date: Timestamp.fromDate(appointmentDate),
          time: selectedTime,
          createdAt: Timestamp.now(),
          status: 'pending',
        };
        await addDoc(collection(db, 'appointments'), appointmentData);

        const doctorRef = doc(db, 'users', doctor.uid);
        const currentAvailableSlots = doctorData.availableSlots || [];
        const updatedAvailableSlots = currentAvailableSlots
          .map((s: any) =>
            s.date === formattedDate ? { ...s, time: s.time.filter((t: string) => t !== selectedTime) } : s,
          )
          .filter((s: any) => s.time.length > 0);

        await updateDoc(doctorRef, { availableSlots: updatedAvailableSlots });

        if (setUsers) {
          setUsers((prevUsers) =>
            prevUsers.map((d) => (d.uid === doctor.uid ? { ...d, availableSlots: updatedAvailableSlots } : d)),
          );
        }

        if (updateDoctorAvailableSlots && setSelectedDoctor) {
          setTimeout(() => updateDoctorAvailableSlots(doctor, setSelectedDoctor, updatedAvailableSlots), 2000);
        }

        setSuccessMessage('Appointment confirmed!');
      } catch (error) {
        console.error('Error creating appointment:', error);
        setErrorMessage('Failed to create appointment. Please try again.');
        setIsConfirming(false);
      }
    },
    [setErrorMessage, setSuccessMessage, setIsConfirming, setUsers, setSelectedDoctor],
  );

  return confirmAppointmentHandler;
};

export default useConfirmAppointment;
