'use client';
import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import { User, MapPin, Phone, Edit2, LogOut } from 'lucide-react';
import { auth } from '../../../backend/lib/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import AvailableTimePicker from '@/components/AvailableTimePicker';
import { Slot, UserType } from '@/interfaces/interfaces';
import useUpdateAvailableSlots from '../../../hooks/useUpdateAvaliableSlots';
import useSaveProfileChanges from '../../../hooks/useSaveProfileChanges';
import Loading from '@/components/Loading';
import fetchUserData from '@/app/api/fetchUserData';
import Image from 'next/image';

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState<UserType>({
    uid: '',
    name: '',
    surname: '',
    phone: '',
    selectedAddress: {
      coordinates: [0, 0],
      id: '',
      place_name: '',
    },
    role: '',
    photoURL: '',
    fields: [],
    availableSlots: [],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/authorisation');
        return;
      }

      const userData = await fetchUserData(currentUser.uid);
      if (userData) {
        setUser(userData);
        if (userData.availableSlots) setAvailableSlots(userData.availableSlots);
        setFormData(userData);
        setPhotoPreview(userData.photoURL || '');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);
  const handleUpdateAvailableSlots = useUpdateAvailableSlots(
    user,
    setAvailableSlots,
    setSuccessMessage,
    setErrorMessage,
  );
  const handleSaveProfileChanges = useSaveProfileChanges(
    user,
    formData,
    photo,
    availableSlots,
    setPhoto,
    setPhotoPreview,
    setEditing,
  );
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevFormData) => ({ ...prevFormData, [e.target.name]: e.target.value }));
  }, []);
  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, []);
  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push('/home');
  }, [router]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="">
      <div className="max-w-6xl flex justify-center h-[calc(100dvh-4rem)] mx-auto p-0 md:p-4">
        <div
          className={`${user.role === 'patient' && 'max-w-[42rem]'} bg-white rounded-none md:rounded-xl shadow-xl h-min overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className={'w-full'}>
                <div className={'flex flex-row items-center justify-between'}>
                  <h1 className="text-2xl font-bold text-white">My Profile</h1>
                  <div className="w-auto">
                    <button
                      onClick={editing ? handleSaveProfileChanges : () => setEditing(true)}
                      className={`flex items-center justify-center w-full px-3 py-2 rounded-lg font-medium ${
                        editing
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition text-sm md:text-base`}
                    >
                      {editing ? 'Save Changes' : 'Edit'}
                    </button>
                  </div>
                </div>

                <p className="text-blue-100 mt-1">Manage your account information and availability</p>
              </div>
            </div>
          </div>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" role="alert">
              <strong className="font-bold">Warning!</strong>
              <span className="block sm:inline"> {errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}
          <div className="p-4">
            <div className={`flex flex-col ${user.role === 'doctor' && 'lg:flex-row'} gap-0 md:gap-6 lg:gap-8`}>
              {/* Left Column - Profile Photo */}
              <div className={`${user.role === 'doctor' && 'lg:w-1/3'} flex flex-col items-center`}>
                <div className="flex flex-col items-center w-full">
                  <div className="relative">
                    <div className="w-36 h-36 relative rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                      <Image src={photoPreview} fill alt="Profile" className="object-cover w-full h-full" />
                    </div>
                    {editing && (
                      <div className="absolute bottom-2 right-2">
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer bg-blue-600 hover:bg-blue-700 transition w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md"
                        >
                          <Edit2 className="w-5 h-5" />
                        </label>
                      </div>
                    )}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                    {`${formData.name} ${formData.surname}`}
                  </h2>
                  <div className="mt-1 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">
                    {formData.role === 'doctor' ? 'Doctor' : 'Patient'}
                  </div>
                  {user.role === 'doctor' && formData.fields && formData.fields.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {formData.fields.map((field, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="w-full mt-4 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Address</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-gray-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        {editing ? (
                          <PlacesAutocomplete
                            placeHolder={formData.selectedAddress.place_name}
                            setSelectedAddress={(e) => {
                              setFormData((prevFormData) => ({ ...prevFormData, selectedAddress: e }));
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData.selectedAddress.place_name}
                            disabled
                            className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <Input
                      icon={<User className="text-gray-400" />}
                      label="First Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                    <Input
                      icon={<User className="text-gray-400" />}
                      label="Last Name"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                    <Input
                      icon={<Phone className="text-gray-400" />}
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Details */}
              <div className={`${user.role === 'doctor' && 'lg:w-2/3'}`}>
                <div className="mt-3 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4">
                  <div className="w-full">
                    <button
                      onClick={() => router.push('/appointments')}
                      className="flex items-center justify-center px-4 py-3 w-full h-full rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm md:text-base"
                    >
                      Appointments
                    </button>
                  </div>
                  <div className="w-full">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition text-sm md:text-base"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
                {user.role === 'doctor' && (
                  <AvailableTimePicker
                    availableSlots={availableSlots}
                    onUpdateAvailableSlots={handleUpdateAvailableSlots}
                    setErrorMessage={setErrorMessage}
                    setSuccessMessage={setSuccessMessage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const Input = ({
  label,
  name,
  value,
  onChange,
  icon,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  icon: ReactNode;
  disabled: boolean;
}) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-3.5">{icon}</div>}
        <input
          type={'text'}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition ${disabled ? 'bg-gray-50' : 'bg-white'}`}
        />
      </div>
    </div>
  );
};
export default Profile;
