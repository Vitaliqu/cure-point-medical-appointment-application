import { Dispatch, SetStateAction, useCallback } from 'react';
import { Appointment, PaymentData, UserType } from '@/interfaces/interfaces';
import fetchUsersData from '@/app/api/fetchUsersData';
import { collection, getDocs, or, query, where } from 'firebase/firestore';
import { db } from '../../../backend/lib/firebaseConfig';

const useFetchAppointments = ({
  setPayments,
  setActiveAppointments,
  setPastAppointments,
  setLoading,
  currentUser,
  selectedDate,
}: {
  setPayments: Dispatch<SetStateAction<PaymentData[]>>;
  setActiveAppointments: Dispatch<SetStateAction<Appointment[]>>;
  setPastAppointments: Dispatch<SetStateAction<Appointment[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  currentUser: UserType | null;
  selectedDate: Date | null;
}) => {
  return useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const users: UserType[] | undefined = await fetchUsersData();
      const appointmentsRef = collection(db, 'appointments');
      const { role: userRole, uid: userId } = currentUser;
      const appointmentsQuery =
        userRole === 'doctor'
          ? query(appointmentsRef, or(where('doctorId', '==', userId), where('patientId', '==', userId)))
          : query(appointmentsRef, where('patientId', '==', userId));
      const fetchedAppointments = (await getDocs(appointmentsQuery)).docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        patientName: users?.find((user) => user.uid === doc.data().patientId)?.name,
        doctorName: users?.find((user) => user.uid === doc.data().doctorId)?.name,
        date: (doc.data().date as { toDate: () => Date }).toDate(),
      })) as Appointment[];
      const paymentsRef = collection(db, 'payments');
      const fetchedPayments = (await getDocs(paymentsRef)).docs.map((doc) => doc.data() as PaymentData);
      setPayments(fetchedPayments);
      const filteredByDate = selectedDate
        ? fetchedAppointments.filter(
            (appt) =>
              appt.date.getFullYear() === selectedDate.getFullYear() &&
              appt.date.getMonth() === selectedDate.getMonth() &&
              appt.date.getDate() === selectedDate.getDate(),
          )
        : fetchedAppointments;
      const sortedAppointments = filteredByDate.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        if (a.status === 'approved' && (b.status === 'declined' || b.status === 'finished')) return -1;
        if ((a.status === 'declined' || a.status === 'finished') && b.status === 'approved') return 1;
        if (a.status === 'declined' && b.status === 'finished') return 1;
        if (a.status === 'finished' && b.status === 'declined') return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setActiveAppointments(
        sortedAppointments.filter((appt) => appt.status === 'pending' || appt.status === 'approved'),
      );
      setPastAppointments(
        sortedAppointments.filter((appt) => appt.status === 'declined' || appt.status === 'finished'),
      );
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedDate, setPayments, setActiveAppointments, setPastAppointments, setLoading]);
};

export default useFetchAppointments;
