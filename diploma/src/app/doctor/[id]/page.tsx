'use client';

import React, { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { MapPin, Star } from 'lucide-react';

import { auth } from '../../../../backend/lib/firebaseConfig';
import fetchUserData from '@/app/api/fetchUserData';
import fetchRatings from '@/app/api/fetchRatings';
import haversineDistance from '@/functions/haversineDistance';
import { UserType } from '@/interfaces/interfaces';

import AppointmentModal from '@/components/AppointmentModal';
import Loading from '@/components/Loading';
import 'react-datepicker/dist/react-datepicker.css';

const MapViewer = dynamic(() => import('@/components/MapViewer'), { ssr: false });

const Doctor: FC<{ params: Promise<{ id: string }> }> = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchDoctorData = async () => {
      try {
        const { id: doctorId } = await params;
        if (!doctorId) return;

        const doctorData = await fetchUserData(doctorId);
        const ratings = (await fetchRatings())?.filter((r) => r.doctor_id === doctorId) || [];

        if (isMounted && doctorData) {
          const averageRating = ratings.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

          setSelectedDoctor({ ...doctorData, rating: averageRating } as UserType);
          setRatingCount(ratings.length);
        }

        if (auth.currentUser) {
          const userData = await fetchUserData(auth.currentUser.uid);
          if (userData?.selectedAddress && doctorData?.selectedAddress) {
            const calculatedDistance = haversineDistance(
              userData.selectedAddress.coordinates,
              doctorData.selectedAddress.coordinates,
            );
            setDistance(calculatedDistance);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    (async () => await fetchDoctorData())();
    return () => {
      isMounted = false;
    };
  }, [params]);

  if (isLoading || !selectedDoctor) return <Loading />;

  const handleAppointmentClick = () => {
    if (!auth.currentUser) {
      router.push('/authorisation');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-8 items-start justify-center bg-white">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-full md:max-w-md md:mr-8 mb-4 md:mb-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 w-full">
          <h1 className="text-xl font-bold text-white md:text-2xl">Doctor&apos;s Profile</h1>
        </div>

        <div className="p-6">
          {/* Doctor Photo */}
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

          {/* Doctor Name */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {selectedDoctor.name} {selectedDoctor.surname}
          </h2>

          {/* Doctor Fields */}
          {selectedDoctor.fields?.length > 0 && (
            <p className="text-gray-600 text-center mb-3">{selectedDoctor.fields.join(', ')}</p>
          )}

          {/* Rating */}
          <div className="flex items-center justify-center mb-2">
            {[...Array(Math.round(selectedDoctor.rating || 0))].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            ))}
            {[...Array(5 - Math.round(selectedDoctor.rating || 0))].map((_, i) => (
              <Star key={i + 5} className="w-5 h-5 text-gray-300" />
            ))}
            <span className="ml-2 text-sm text-gray-500">({ratingCount})</span>
          </div>

          {/* Contact Info */}
          <div className="mb-2">
            <strong className="text-gray-700 block mb-1">Phone:</strong>
            <a href={`tel:${selectedDoctor.phone}`} className="text-blue-600 hover:underline">
              {selectedDoctor.phone}
            </a>
          </div>

          {/* Location Info */}
          <div className="mb-2">
            <strong className="text-gray-700 block mb-1">Location:</strong>
            <p className="text-gray-600">{selectedDoctor.selectedAddress?.place_name || 'No location provided'}</p>
            {distance && <p className="text-sm text-gray-500 mt-1">{distance.toFixed(1)} km away</p>}
            {selectedDoctor.selectedAddress?.coordinates && (
              <button
                onClick={() => setIsMapOpen((prev) => !prev)}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-full text-sm transition"
              >
                <MapPin className="inline-block mr-1 align-text-bottom w-4 h-4" />
                Show on Map
              </button>
            )}
          </div>

          {/* Make Appointment Button */}
          {(!auth.currentUser || selectedDoctor.uid !== auth.currentUser.uid) && (
            <button
              onClick={handleAppointmentClick}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Make An Appointment
            </button>
          )}

          {/* Appointment Modal */}
          {isModalOpen && (
            <AppointmentModal
              doctor={selectedDoctor}
              onClose={() => setIsModalOpen(false)}
              setIsModalOpen={setIsModalOpen}
              setUsers={null}
              setSelectedDoctor={setSelectedDoctor}
            />
          )}
        </div>
      </div>

      {/* Map Viewer */}
      {selectedDoctor.selectedAddress?.coordinates && isMapOpen && (
        <div className="w-full md:max-w-md rounded-xl h-[532px] shadow-md overflow-hidden">
          <MapViewer users={[selectedDoctor]} currentAddress={selectedDoctor.selectedAddress} zoom={10} />
        </div>
      )}
    </div>
  );
};

export default Doctor;
