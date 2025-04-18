'use client';

import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { auth, db } from '../../../../backend/lib/firebaseConfig';
import Image from 'next/image';
import fetchUserData from '../../../../backend/pages/api/fetchUserData/fetchUserData';
import 'react-datepicker/dist/react-datepicker.css';
import AppointmentModal from '@/components/AppointmentModal';
import haversineDistance from '@/functions/haversineDistance';
import { AddressProps, Slot, UserType } from '@/interfaces/interfaces';
import { doc, updateDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
});

const Doctor = ({ params }: { params: Promise<{ id: string }> }) => {
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<AddressProps | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);

  const updateDoctorAvailableSlots = async (doctorId: string, updatedAvailableSlots: Slot[]) => {
    try {
      const doctorRef = doc(db, 'users', doctorId);
      await updateDoc(doctorRef, { availableSlots: updatedAvailableSlots });
      // After updating in the database, also update the local state
      if (selectedDoctor && selectedDoctor.uid === doctorId) {
        setSelectedDoctor({ ...selectedDoctor, availableSlots: updatedAvailableSlots });
      }
    } catch (error) {
      console.error('Error updating doctors available slots:', error);
      // Optionally handle error feedback to the user
    }
  };

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component
    const fetchUsers = async () => {
      const resolvedParams = await params;
      const doctorId = resolvedParams.id;
      try {
        if (doctorId) {
          const doctorData = await fetchUserData(doctorId);
          if (doctorData && isMounted) {
            setSelectedDoctor(doctorData as UserType);
          }
        }
        if (auth.currentUser) {
          const userData = await fetchUserData(auth.currentUser.uid);
          if (userData) {
            setSelectedAddress(userData.selectedAddress);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (selectedDoctor && selectedAddress) {
      setDistance(haversineDistance(selectedAddress.coordinates, selectedDoctor.selectedAddress.coordinates));
    }
  }, [selectedDoctor, selectedAddress]);

  const handleShowOnMap = () => {
    setIsMapOpen(!isMapOpen);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  if (!selectedDoctor) return <></>;
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-8 items-start justify-center bg-white">
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-full md:max-w-md md:mr-8 mb-4 md:mb-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 m-0 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white md:text-2xl">Doctor`s Profile</h1>
          </div>
        </div>
        <div className={'p-6'}>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                fill
                src={selectedDoctor.photoURL}
                alt={`${selectedDoctor.name} ${selectedDoctor.surname}`}
                className="object-cover"
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {selectedDoctor.name} {selectedDoctor.surname}
          </h2>
          {selectedDoctor.fields && selectedDoctor.fields.length > 0 && (
            <p className="text-gray-600 text-center mb-3">{selectedDoctor.fields.join(', ')}</p>
          )}
          <div className="mb-2">
            <strong className="text-gray-700 block mb-1">Phone:</strong>
            <a href={`tel:${selectedDoctor.phone}`} className="text-blue-600 hover:underline">
              {selectedDoctor.phone}
            </a>
          </div>
          <div className="mb-2">
            <strong className="text-gray-700 block mb-1">Location:</strong>
            <p className="text-gray-600">{selectedDoctor.selectedAddress?.place_name || 'No location provided'}</p>
            {distance !== null && <p className="text-sm text-gray-500 mt-1">{distance.toFixed(1)} km away</p>}
            {selectedDoctor.selectedAddress?.coordinates && (
              <button
                onClick={handleShowOnMap}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-full text-sm transition duration-300"
              >
                <MapPin className="inline-block mr-1 align-text-bottom w-4 h-4" />
                Show on Map
              </button>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Make An Appointment
          </button>

          {isModalOpen && (
            <AppointmentModal
              doctor={selectedDoctor}
              onClose={() => setIsModalOpen(false)}
              setIsModalOpen={setIsModalOpen}
              setUsers={null}
              setSelectedDoctor={null}
              updateDoctorAvailableSlots={updateDoctorAvailableSlots}
            />
          )}
        </div>
      </div>
      {selectedDoctor.selectedAddress?.coordinates && selectedAddress && isMapOpen && (
        <div className="w-full md:max-w-md rounded-xl h-[532px] shadow-md overflow-hidden">
          <MapViewer users={[selectedDoctor]} currentAddress={selectedDoctor.selectedAddress} zoom={10} />
        </div>
      )}
    </div>
  );
};

export default Doctor;
