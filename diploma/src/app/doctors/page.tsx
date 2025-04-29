'use client';

import React, { FC, useEffect, useState } from 'react';
import { User, Search, Pen, Star } from 'lucide-react';
import { auth } from '../../../backend/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import fetchUserData from '@/app/api/fetchUserData';
import fetchDoctorsData from '@/app/api/fetchDoctorsData';
import haversineDistance from '@/functions/haversineDistance';
import AppointmentModal from '@/components/AppointmentModal';
import { onAuthStateChanged } from 'firebase/auth';

import { UserType, AddressProps } from '@/interfaces/interfaces';
import 'react-datepicker/dist/react-datepicker.css';
import Loading from '@/components/Loading';
import fetchRatingsData from '@/app/api/fetchRatings';

const Doctors: FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<AddressProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const router = useRouter();

  // Fetch user location on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchUserData(user.uid);
        if (userData) setSelectedAddress(userData.selectedAddress);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch doctors and ratings
  useEffect(() => {
    const fetchDoctorsAndRatings = async () => {
      try {
        const doctorsData = await fetchDoctorsData();
        const ratings = await fetchRatingsData();

        if (doctorsData) {
          const enrichedDoctors = doctorsData.map((doctor) => {
            const doctorRatings = ratings?.filter((rating) => rating.doctor_id === doctor.uid) || [];
            const totalRating = doctorRatings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = doctorRatings.length ? totalRating / doctorRatings.length : 0;
            const distance = selectedAddress
              ? haversineDistance(selectedAddress.coordinates, doctor.selectedAddress.coordinates)
              : null;

            return {
              ...doctor,
              rating: averageRating,
              ratingCount: doctorRatings.length,
              distance,
            };
          });
          setUsers(enrichedDoctors);
        }
      } catch (error) {
        console.error('Error fetching doctors or ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    (async () => await fetchDoctorsAndRatings())();
  }, [selectedAddress]);

  const handleDoctorSelect = (doctor: UserType) => {
    if (!auth.currentUser) {
      router.push(`/authorisation`);
      return;
    }

    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center">
      <div className="sm:max-w-4xl w-full md:px-4 md:py-6">
        <div className="bg-white shadow-lg rounded-none md:rounded-2xl overflow-hidden flex flex-col min-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-5">
            <h1 className="text-lg sm:text-2xl font-bold text-white">Doctors</h1>
          </div>

          {/* Search */}
          <div className="p-4 sm:p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <PlacesAutocomplete setSelectedAddress={setSelectedAddress} />
            </div>
          </div>

          {/* Doctors List */}
          <div className="p-4 sm:p-6 flex-grow space-y-4">
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
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer"
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
                    <div className="flex items-center justify-center sm:justify-start space-x-1 mt-1">
                      {[...Array(Math.round(user.rating || 0))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                      {[...Array(5 - Math.round(user.rating || 0))].map((_, i) => (
                        <Star key={i + 5} className="w-4 h-4 text-gray-300" />
                      ))}
                      <span className="text-xs text-gray-500">({user.ratingCount})</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.distance ? `${user.distance.toFixed(1)} km away` : 'Distance unknown'}
                    </p>
                  </div>

                  {user.uid !== auth.currentUser?.uid && (
                    <button
                      onClick={() => handleDoctorSelect(user)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm w-full sm:w-auto"
                    >
                      <Pen className="w-4 h-4 mr-2" />
                      Make An Appointment
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && selectedDoctor && (
        <AppointmentModal
          doctor={selectedDoctor}
          onClose={() => setIsModalOpen(false)}
          setIsModalOpen={setIsModalOpen}
          setUsers={setUsers}
          setSelectedDoctor={null}
        />
      )}
    </div>
  );
};

export default Doctors;
