'use client';
import React, { FC, useEffect, useState, useCallback } from 'react';
import { User } from 'lucide-react';
import { db, auth } from '../../../backend/lib/firebaseConfig';
import { collection, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUsersData from '../../../backend/pages/api/fetchUsersData/fetchUsersData';
import { format } from 'date-fns';
import { Appointment, UserType } from '@/interfaces/interfaces';

const Appointments: FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();

  const fetchAppointments = useCallback(async () => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsSnap = await getDocs(appointmentsRef);
      const fetchedAppointments = appointmentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/authorisation');
        return;
      }

      setUserId(currentUser.uid);
      const usersData = await fetchUsersData();
      if (usersData) {
        setUsers(usersData);
      }
      await fetchAppointments();
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, fetchAppointments]);

  const handleApprove = useCallback(async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'approved' });
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) => (appt.id === appointmentId ? { ...appt, status: 'approved' } : appt)),
      );
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  }, []);

  const handleDecline = useCallback(
    async (appointmentId: string, appointmentDate: Date) => {
      try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentData = appointments.find((appt) => appt.id === appointmentId);

        if (appointmentData) {
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
        setAppointments((prevAppointments) =>
          prevAppointments.map((appt) => (appt.id === appointmentId ? { ...appt, status: 'declined' } : appt)),
        );
      } catch (error) {
        console.error('Error declining appointment:', error);
      }
    },
    [appointments],
  );

  const filteredAppointments = selectedDate
    ? appointments.filter((appointment) => {
        const appointmentDate = appointment.date.toDate();
        return (
          appointmentDate.getFullYear() === selectedDate.getFullYear() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getDate() === selectedDate.getDate()
        );
      })
    : appointments;

  const currentUser = auth.currentUser;
  const isDoctor = currentUser ? users.some((user) => user.uid === currentUser.uid && user.role === 'doctor') : false;

  const userAppointments = currentUser
    ? filteredAppointments.filter((appointment) =>
        isDoctor ? appointment.doctorId === userId : appointment.patientId === userId,
      )
    : [];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (userAppointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex justify-center sm:py-12">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-6 text-lg font-medium text-gray-900">No Appointments Yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              {isDoctor
                ? 'When users book appointments with you, they will appear here.'
                : 'Your booked appointments will appear here.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex justify-center sm:py-12">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full max-w-3xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Appointments</h2>
          {/* Date Picker (Basic Input Type=Date) */}
          <div className="mt-4">
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700">
              Filter by Date:
            </label>
            <input
              type="date"
              id="filterDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </div>
        </div>
        <ul className="space-y-4">
          {userAppointments.map((appointment) => {
            const patient = users.find((user) => user.uid === appointment.patientId);
            const appointmentDate = appointment.date.toDate();
            return (
              <li key={appointment.id} className="bg-gray-50 rounded-md p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4 mb-2">
                  {patient?.photoURL ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image src={patient.photoURL} alt={patient.name} layout="fill" objectFit="cover" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
                      <User className="text-gray-500" size={20} />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-blue-600">{appointment.patientName}</p>
                </div>
                <p className="text-sm text-gray-500">Date: {format(appointmentDate, 'MMMM d, yyyy')}</p>
                <p className="text-sm text-gray-500">Time: {format(appointmentDate, 'HH:mm')}</p>
                <div className="mt-4 flex space-x-2">
                  {isDoctor && appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(appointment.id, appointmentDate)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {appointment.status === 'approved' && (
                    <span className="px-2 py-1 bg-green-200 flex items-center text-green-700 rounded-full text-xs font-semibold">
                      Approved
                    </span>
                  )}
                  {appointment.status === 'declined' && (
                    <span className="px-2 py-1 bg-red-200 flex items-center text-red-700 rounded-full text-xs font-semibold">
                      Declined
                    </span>
                  )}
                  {!isDoctor && appointment.status === 'pending' && (
                    <span className="px-2 py-1 bg-yellow-200 flex items-center text-yellow-700 rounded-full text-xs font-semibold">
                      Pending
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Appointments;
