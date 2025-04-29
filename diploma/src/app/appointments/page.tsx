'use client';
import React, { FC, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../../../backend/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUsersData from '@/app/api/fetchUsersData';
import { UserType, PaymentData } from '@/interfaces/interfaces';
import RenderAppointmentsList from '../../components/RenderAppointmentsList';
import { formatDateForInput } from '../../../backend/lib/dateUtils';

const AppointmentsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [users, setUsers] = useState<UserType[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/authorisation');
        return;
      }
      const usersData = await fetchUsersData();
      if (usersData) {
        setUsers(usersData);
        const loggedInUser = usersData.find((u) => u.uid === user.uid);
        setCurrentUser(loggedInUser || null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateValue = event.target.value;
    setSelectedDate(selectedDateValue ? new Date(selectedDateValue) : null);
  };

  const handleClearFilter = () => {
    setSelectedDate(null);
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

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
                  onChange={handleDateChange}
                  value={selectedDate ? formatDateForInput(selectedDate) : ''} // Controlled input
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
        <RenderAppointmentsList
          activeTab={activeTab}
          payments={payments}
          setPayments={setPayments}
          currentUser={currentUser}
          users={users}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default AppointmentsPage;
