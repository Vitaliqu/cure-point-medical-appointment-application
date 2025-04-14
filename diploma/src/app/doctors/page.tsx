'use client';
import React, { FC, useEffect, useState } from 'react';
import { User, Search, Pen } from 'lucide-react';
import { db, auth } from '../../../backend/lib/firebaseConfig';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import PlacesAutocomplete from '@/components/PlacesAutocomplete/PlacesAutocomplete';
import fetchUserData from '../../../backend/pages/api/fetchUserData/fetchUserData';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Timestamp } from 'firebase/firestore';

interface AvailableSlot {
  date: string;
  time: string[];
}

interface UserType {
  uid: string;
  displayName: string;
  role: string;
  photoURL: string;
  coordinates: [number, number];
  availableSlots: AvailableSlot[]; // поле для доступних слотів
  distance?: number;
}

interface AddressProps {
  coordinates: [number, number];
  id: string;
  place_name: string;
}

function haversineDistance(coords1: [number, number], coords2: [number, number]) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const Doctors: FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<AddressProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [availableTimesForSelectedDate, setAvailableTimesForSelectedDate] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const userData = await fetchUserData(auth.currentUser.uid);
      if (!userData) return;
      setSelectedAddress(userData.selectedAddress);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'doctor'));
        const querySnapshot = await getDocs(q);

        const userList: UserType[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userList.push({
            uid: doc.id,
            displayName: data.name,
            role: data.role,
            photoURL: data.photoURL || '',
            coordinates: data.selectedAddress?.coordinates || [0, 0],
            availableSlots: data.availableSlots || [],
          });
        });

        const currentUser = auth.currentUser;
        const filteredList = currentUser ? userList.filter((user) => user.uid !== currentUser.uid) : userList;

        if (selectedAddress) {
          filteredList.forEach((doctor) => {
            doctor.distance = haversineDistance(selectedAddress.coordinates, doctor.coordinates);
          });
          filteredList.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setUsers(filteredList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedAddress]);

  const handleConfirmAppointment = async () => {
    if (!appointmentDate || !selectedDoctor || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'appointments'), {
        doctorId: selectedDoctor.uid,
        doctorName: selectedDoctor.displayName,
        patientId: auth.currentUser.uid,
        patientName: auth.currentUser.displayName,
        date: Timestamp.fromDate(appointmentDate), // Store as Firebase Timestamp
        createdAt: Timestamp.now(),
      });

      setIsModalOpen(false);
      setAppointmentDate(null);
      setSelectedDoctor(null);
      setAvailableTimesForSelectedDate([]);
      alert('Appointment successfully created!');
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleDoctorSelect = (doctor: UserType) => {
    setSelectedDoctor(doctor);
    setAppointmentDate(null); // Reset the date when a new doctor is selected
    setAvailableTimesForSelectedDate([]); // Reset available times
    setIsModalOpen(true);
  };

  const handleDateChange = (date: Date | null) => {
    setAppointmentDate(date);
    if (date && selectedDoctor) {
      const formattedDate = date.toISOString().slice(0, 10);
      const availableSlotForDate = selectedDoctor.availableSlots.find((slot) => slot.date === formattedDate);
      setAvailableTimesForSelectedDate(availableSlotForDate?.time || []);
    } else {
      setAvailableTimesForSelectedDate([]);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b flex justify-center from-blue-50 to-white">
      <div className="sm:max-w-4xl w-full p-0 m-0 mx-auto md:px-4 md:py-6">
        <div className="bg-white rounded-none md:rounded-2xl shadow-lg overflow-hidden flex flex-col min-h-[90vh]">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-lg sm:text-2xl font-bold text-white">Doctors</h1>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <PlacesAutocomplete setSelectedAddress={setSelectedAddress} />
            </div>
          </div>

          <div className="p-4 sm:p-6 flex-grow">
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Nothing found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.uid}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition cursor-pointer border border-gray-100"
                  >
                    <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 mx-auto sm:mx-0">
                      <Image fill src={user.photoURL} alt={user.displayName} className="object-cover" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                      <p className="text-sm text-gray-500">
                        {user.distance !== undefined ? `${user.distance.toFixed(1)} km away` : 'Distance unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDoctorSelect(user)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm w-full sm:w-auto"
                    >
                      <Pen className="w-4 h-4 mr-2" />
                      Make An Appointment
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 space-y-4">
            <h2 className="text-xl font-semibold">Select appointment date and time for {selectedDoctor.displayName}</h2>
            <DatePicker
              selected={appointmentDate}
              onChange={handleDateChange}
              minDate={new Date()}
              showTimeSelect
              timeIntervals={30}
              dateFormat="Pp"
              filterDate={(date) => {
                const formattedDate = date.toISOString().slice(0, 10);
                return selectedDoctor.availableSlots.some((slot) => slot.date === formattedDate);
              }}
              filterTime={(time) => {
                if (!appointmentDate) return false;
                const formattedDate = appointmentDate.toISOString().slice(0, 10);
                const availableSlotForDate = selectedDoctor.availableSlots.find((slot) => slot.date === formattedDate);
                if (availableSlotForDate && availableSlotForDate.time) {
                  const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
                  return availableSlotForDate.time.includes(timeString);
                }
                return false;
              }}
              className="w-full border px-2 py-1 rounded"
            />
            {appointmentDate && availableTimesForSelectedDate.length === 0 && (
              <p className="text-sm text-red-500">No available times for the selected date.</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAppointment}
                disabled={!appointmentDate}
                className={`px-4 py-2 rounded ${
                  appointmentDate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
