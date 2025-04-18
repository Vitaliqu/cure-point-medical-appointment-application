'use client';
import React, { FC, useEffect, useState, useCallback } from 'react';
import { User, X } from 'lucide-react';
import { db, auth } from '../../../backend/lib/firebaseConfig';
import { collection, doc, getDocs, updateDoc, getDoc, where, query, or } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUsersData from '../../../backend/pages/api/fetchUsersData/fetchUsersData';
import { format } from 'date-fns';
import { Appointment, UserType } from '@/interfaces/interfaces';

const Appointments: FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const router = useRouter();
  const fetchAppointments = useCallback(
    async (currentUser: UserType) => {
      if (!currentUser) {
        return;
      }
      try {
        const appointmentsRef = collection(db, 'appointments');
        const userRole = currentUser?.role;
        const userId = currentUser.uid;

        let appointmentsQuery;
        if (userRole === 'doctor') {
          appointmentsQuery = query(
            appointmentsRef,
            or(where('doctorId', '==', userId), where('patientId', '==', userId)),
          );
        } else {
          appointmentsQuery = query(appointmentsRef, where('patientId', '==', userId));
        }
        const selectedDay = selectedDate?.getDate();

        const fetchedAppointments = (await getDocs(appointmentsQuery)).docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date.toDate(),
              status: data.status,
            };
          })
          .filter(({ date }) => (selectedDay !== undefined ? date.getDate() === selectedDay : true)) as Appointment[];

        const activeAppointments = fetchedAppointments.filter(
          ({ status }) => status === 'pending' || status === 'approved',
        );

        const pastAppointments = fetchedAppointments.filter(({ status }) => status === 'declined');

        setActiveAppointments(activeAppointments);
        setPastAppointments(pastAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    },
    [setActiveAppointments, setPastAppointments, selectedDate],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Rename currentUser to user here
      if (!user) {
        router.push('/authorisation');
        return;
      }
      const usersData = await fetchUsersData();
      if (usersData) {
        setUsers(usersData);
        const loggedInUser = usersData.filter((u) => u.uid === user.uid)[0];
        setCurrentUser(loggedInUser);
        await fetchAppointments(loggedInUser); // Call fetchAppointments with the logged-in user
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, fetchAppointments]); // Remove fetchAppointments from the dependency array

  const handleApprove = useCallback(async (appointmentId: string) => {
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
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateValue = event.target.value;
    const newDate = selectedDateValue
      ? new Date(new Date(selectedDateValue).setDate(new Date(selectedDateValue).getDate() + 1))
      : null;
    setSelectedDate(newDate);
  };
  const handleDecline = useCallback(
    async (appointmentId: string, appointmentDate: Date) => {
      try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentData =
          activeAppointments.find((appt) => appt.id === appointmentId) ||
          pastAppointments.find((appt) => appt.id === appointmentId);

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
    [activeAppointments, pastAppointments],
  );

  const isDoctor = currentUser ? users.some((user) => user.uid === currentUser.uid && user.role === 'doctor') : false;

  const handleClearFilter = () => {
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const renderEmptyState = () => (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="text-center">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-6 text-lg font-medium text-gray-900">No Appointments Here</h2>
        <p className="mt-2 text-sm text-gray-500">
          {isDoctor
            ? activeTab === 'active'
              ? 'When users book appointments with you, they will appear here.'
              : 'Your past appointments will be shown here.'
            : activeTab === 'active'
              ? 'Your upcoming appointments will appear here.'
              : 'Your past appointments will be shown here.'}
        </p>
      </div>
    </div>
  );

  const renderAppointmentsList = (appointmentsToRender: Appointment[]) => {
    if (appointmentsToRender.length === 0) {
      return renderEmptyState();
    }
    if (!currentUser) return <div>Loading...</div>;
    return (
      <ul className="space-y-4">
        {appointmentsToRender.map((appointment) => {
          const patient = users.find((user) => user.uid === appointment.patientId);
          const doctor = users.find((user) => user.uid === appointment.doctorId);

          const appointmentDate = appointment.date;
          return (
            <li key={appointment.id} className="bg-gray-50 rounded-md p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-2">
                {patient?.photoURL ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    {currentUser && patient && doctor && (
                      <Image
                        src={currentUser.uid === appointment.doctorId ? patient.photoURL : doctor?.photoURL}
                        alt={patient.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
                    <User className="text-gray-500" size={20} />
                  </div>
                )}
                <p className="text-sm">
                  Appointment with {appointment.patientId === currentUser.uid ? 'Doctor' : 'Patient'}{' '}
                  <strong className={'text-blue-600 font-semibold'}>
                    {(appointment.patientId === currentUser.uid && appointment.doctorName) || appointment.patientName}
                  </strong>
                </p>
              </div>
              <p className="text-sm text-gray-500">Date: {format(appointmentDate, 'MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-500">
                Address: {users.filter((user) => user.uid === appointment.doctorId)[0].selectedAddress.place_name}
              </p>
              <p className="text-sm text-gray-500">Time: {format(appointmentDate, 'HH:mm')}</p>
              <div className="mt-4 flex space-x-2">
                {appointment.doctorId === currentUser.uid &&
                  isDoctor &&
                  appointment.status === 'pending' &&
                  activeTab === 'active' && (
                    <>
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        className="px-4 py-2 bg-green-500 transition-colors text-white rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(appointment.id, appointmentDate)}
                        className="px-4 py-2 transition-colors bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
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
                {appointment.patientId === currentUser.uid && appointment.status === 'pending' && (
                  <span className="px-2 py-1 bg-yellow-200 flex items-center text-yellow-700 rounded-full text-xs font-semibold">
                    Pending
                  </span>
                )}
                {appointment.status === 'approved' && (
                  <button
                    onClick={() => router.push(`/appointment_chat/${appointment.id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Chat
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex justify-center sm:py-12">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full max-w-3xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Appointments</h2>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`${
                activeTab === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              Active Appointments
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              Appointment History
            </button>
          </div>
          {/* Date Picker and Clear Filter */}
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex-1">
              <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700">
                Filter by Date:
              </label>
              <div className={'flex flex-row items-center'}>
                <input
                  type="date"
                  id="filterDate"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  onChange={handleDateChange} // Use the new handler with logging
                />
                {selectedDate && (
                  <button
                    onClick={handleClearFilter}
                    className="px-3 py-2 rounded-md text-sm font-semibold text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Clear Filter</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'active' && renderAppointmentsList(activeAppointments)}
        {activeTab === 'history' && renderAppointmentsList(pastAppointments)}
      </div>
    </div>
  );
};

export default Appointments;
