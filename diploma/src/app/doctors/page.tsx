'use client';

import React, { FC, useEffect, useState } from 'react';
import { User, Search, Pen } from 'lucide-react';
import { db, auth } from '../../../backend/lib/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import fetchUserData from '../../../backend/pages/api/fetchUserData/fetchUserData';
import 'react-datepicker/dist/react-datepicker.css';
import AppointmentModal from '@/components/AppointmentModal';
import { onAuthStateChanged } from 'firebase/auth';
import haversineDistance from '@/functions/haversineDistance';
import { UserType, AddressProps } from '@/interfaces/interfaces';

type ExtendedUserType = UserType & {
  distance?: number;
};

const Doctors: FC = () => {
  const [users, setUsers] = useState<ExtendedUserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<AddressProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setSelectedAddress(userData.selectedAddress);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'doctor'));
        const querySnapshot = await getDocs(q);
        const userList: ExtendedUserType[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userList.push({
            uid: doc.id,
            name: data.name,
            surname: data.surname,
            phone: data.phone,
            selectedAddress: data.selectedAddress,
            role: data.role,
            photoURL: data.photoURL || '',
            fields: data.fields,
            availableSlots: data.availableSlots || [],
          });
        });

        const currentUser = auth.currentUser;
        const filteredList = currentUser ? userList.filter((user) => user.uid !== currentUser.uid) : userList;

        if (selectedAddress) {
          filteredList.forEach((doctor) => {
            doctor.distance = haversineDistance(selectedAddress.coordinates, doctor.selectedAddress.coordinates);
          });

          filteredList.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setUsers(filteredList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        if (selectedAddress) setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedAddress]);

  const handleDoctorSelect = (doctor: UserType) => {
    if (!auth.currentUser) {
      router.push(`/authorisation`);

      return;
    }

    setSelectedDoctor(doctor);

    setIsModalOpen(true);
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
                      <Image
                        onClick={() => router.push(`/doctor/${user.uid}`)}
                        fill
                        src={user.photoURL}
                        alt={user.name}
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>

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
        <AppointmentModal
          doctor={selectedDoctor}
          onClose={() => setIsModalOpen(false)}
          setIsModalOpen={setIsModalOpen}
          setUsers={setUsers}
          setSelectedDoctor={null}
          updateDoctorAvailableSlots={null}
        />
      )}
    </div>
  );
};

export default Doctors;
