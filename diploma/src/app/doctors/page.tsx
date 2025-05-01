'use client';
import React, { FC, useEffect, useState } from 'react';
import { User, Star, MapPin, Calendar, Filter, Award, ChevronDown, Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import AppointmentModal from '@/components/AppointmentModal';
import Loading from '@/components/Loading';
import fetchUserData from '@/app/api/fetchUserData';
import fetchDoctorsData from '@/app/api/fetchDoctorsData';
import fetchRatingsData from '@/app/api/fetchRatings';
import haversineDistance from '@/functions/haversineDistance';
import { auth } from '../../../backend/lib/firebaseConfig';
import { UserType, AddressProps } from '@/interfaces/interfaces';
import 'react-datepicker/dist/react-datepicker.css';
const MEDICAL_FIELDS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Surgery',
  'Psychiatry',
  'Oncology',
  'Radiology',
  'Urology',
];
const Doctors: FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<AddressProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [selectedField, setSelectedField] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(500);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchUserData(user.uid);
        if (userData) setSelectedAddress(userData.selectedAddress);
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctors, ratings] = await Promise.all([fetchDoctorsData(), fetchRatingsData()]);
        const enriched = doctors?.map((doctor) => {
          const doctorRatings = ratings?.filter((r) => r.doctor_id === doctor.uid) || [];
          const total = doctorRatings.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = doctorRatings.length ? total / doctorRatings.length : 0;
          const distance = selectedAddress
            ? haversineDistance(selectedAddress.coordinates, doctor.selectedAddress.coordinates)
            : null;
          return {
            ...doctor,
            rating: avgRating,
            ratingCount: doctorRatings.length,
            distance,
          };
        });
        if (enriched) setUsers(enriched);
      } catch (error) {
        console.error('Error fetching doctors or ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedAddress]);
  const handleDoctorSelect = (doctor: UserType) => {
    if (!auth.currentUser) return router.push('/authorisation');
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };
  if (isLoading) return <Loading />;
  const filteredUsers = users
    .filter(
      (user) =>
        (selectedField === 'All' || user.fields?.includes(selectedField)) &&
        (user.rating ?? 0) >= minRating &&
        (user.distance === null || (user.distance !== undefined && user.distance <= maxDistance)),
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === 'distance') return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Find Your Doctor</h1>
              <div className="relative flex-1 max-w-lg">
                <PlacesAutocomplete
                  placeHolder={selectedAddress?.place_name || 'Enter your location'}
                  setSelectedAddress={setSelectedAddress}
                />
              </div>
            </div>
          </div>
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-end items-center">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="md:hidden flex items-center text-blue-600 font-medium"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </button>
            </div>
            <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <FilterDropdown
                  label="Specialty"
                  value={selectedField}
                  onChange={setSelectedField}
                  options={['All', ...MEDICAL_FIELDS]}
                  icon={<User className="w-4 h-4 text-blue-500" />}
                />
                <FilterDropdown
                  label="Min Rating"
                  value={minRating}
                  onChange={(v) => setMinRating(Number(v))}
                  options={[0, 1, 2, 3, 4].map((r) => ({
                    label: `${r}+ Stars`,
                    value: r,
                  }))}
                  icon={<Star className="w-4 h-4 text-blue-500" />}
                />
                <FilterDropdown
                  label="Max Distance"
                  value={maxDistance}
                  onChange={(v) => setMaxDistance(v ? Number(v) : Infinity)}
                  options={[
                    {
                      label: 'Any Distance',
                      value: 1000,
                    },
                    {
                      label: '≤ 5 km',
                      value: 5,
                    },
                    {
                      label: '≤ 10 km',
                      value: 10,
                    },
                    {
                      label: '≤ 50 km',
                      value: 50,
                    },
                    {
                      label: '≤ 100 km',
                      value: 100,
                    },
                    {
                      label: '≤ 250 km',
                      value: 250,
                    },
                    {
                      label: '≤ 500 km',
                      value: 500,
                    },
                  ]}
                  icon={<MapPin className="w-4 h-4 text-blue-500" />}
                />
                <FilterDropdown
                  label="Sort By"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    {
                      label: 'Highest Rating',
                      value: 'rating',
                    },
                    {
                      label: 'Closest First',
                      value: 'distance',
                    },
                    {
                      label: 'Name (A-Z)',
                      value: 'name',
                    },
                  ]}
                  icon={<Filter className="w-4 h-4 text-blue-500" />}
                />
              </div>
            </div>
          </div>
          <div className="p-6 flex-grow">
            <div className="mb-4">
              <p className="text-gray-600">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'doctor' : 'doctors'} found
              </p>
            </div>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <NoResults />
              ) : (
                filteredUsers.map((user) => (
                  <DoctorCard
                    key={user.uid}
                    user={user}
                    isCurrentUser={user.uid === auth.currentUser?.uid}
                    onSelect={() => handleDoctorSelect(user)}
                    onView={() => router.push(`/doctor/${user.uid}`)}
                  />
                ))
              )}
            </div>
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
const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: (
    | string
    | {
        label: string;
        value: string | number;
      }
  )[];
  icon?: React.ReactNode;
}) => {
  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-300 hover:border-blue-400 px-4 py-2.5 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
        >
          {options.map((opt) =>
            typeof opt === 'string' ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ),
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
const DoctorCard = ({
  user,
  isCurrentUser,
  onSelect,
  onView,
}: {
  user: UserType;
  isCurrentUser: boolean;
  onSelect: () => void;
  onView: () => void;
}) => (
  <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className="flex flex-col sm:flex-row">
      <div className="relative min-h-50 max-h-50 sm:h-auto sm:w-40 bg-gray-100 cursor-pointer" onClick={onView}>
        <Image src={user.photoURL} alt={user.name} fill className="w-full h-full object-cover" />
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex-1 flex justify-between flex-row">
          <div className="relative flex-shrink-0 w-24 h-24 rounded-full overflow-hidden border-4 mr-2 sm:hidden">
            <Image
              fill
              src={user.photoURL}
              alt={`${user.name} ${user.surname}`}
              onClick={onView}
              className="object-cover cursor-pointer"
            />
          </div>
          <div className={'flex flex-col w-full'}>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 cursor-pointer" onClick={onView}>
                {user.name}
              </h3>
              <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm">
                <Star className="w-4 h-4 fill-current text-yellow-500 mr-1" />
                <span className="font-semibold">{user.rating?.toFixed(1) || 'N/A'}</span>
                <span className="text-gray-500 text-xs ml-1">({user.ratingCount})</span>
              </div>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 text-blue-500 mr-2" />
                <span>{user.fields?.join(', ') || 'General Medicine'}</span>
              </div>
              {user.distance !== undefined && user.distance !== null && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                  <span>{user.distance.toFixed(1)} km away</span>
                </div>
              )}
              {user.availableSlots?.length ? (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  <span>Available</span>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          {!isCurrentUser && (
            <button
              onClick={onSelect}
              className="flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors w-full sm:w-auto"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </button>
          )}
          <button
            onClick={onView}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors w-full sm:w-auto"
          >
            View Profile
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
const NoResults = () => (
  <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-gray-100">
    <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      Try adjusting your search filters or try a different location to find more doctors.
    </p>
  </div>
);
export default Doctors;
