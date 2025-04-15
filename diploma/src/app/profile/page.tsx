'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { User, MapPin, Phone, Edit2, LogOut, MessageCircle, Map } from 'lucide-react';
import { auth, db, storage } from '../../../backend/lib/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import fetchUserData from '../../../backend/pages/api/fetchUserData/fetchUserData';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import AvailableTimePicker from '@/components/AvailableTimePicker';

interface Slot {
  date: string;
  time: string[];
}

interface UserFormData {
  name: string;
  surname: string;
  phone: string;
  selectedAddress: {
    coordinates: [number, number];
    id: string;
    place_name: string;
  };
  role: string;
  availableSlots: Slot[];
  photoURL: string;
}

function Profile() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    surname: '',
    phone: '',
    selectedAddress: {
      coordinates: [0, 0],
      id: '',
      place_name: '',
    },
    role: '',
    availableSlots: [],
    photoURL: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/authorisation');
        return;
      }

      setUser(currentUser);
      const userData = await fetchUserData(currentUser.uid);
      if (userData) {
        setAvailableSlots(userData.availableSlots);
        setFormData(userData);
        setPhotoPreview(userData.photoURL || '');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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

  const handleUpdateAvailableSlots = useCallback(
    async (updatedSlots: Slot[]) => {
      if (!user) return;

      setAvailableSlots(updatedSlots);

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          availableSlots: updatedSlots,
        });
        console.log('Available slots updated in Firestore.');
      } catch (error) {
        console.error('Error updating available slots in Firestore:', error);
      }
    },
    [user],
  );

  const handleSave = useCallback(async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);

    let photoURL = formData.photoURL;

    if (photo) {
      const photoRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(photoRef, photo);
      photoURL = await getDownloadURL(photoRef);
    }

    await updateDoc(userRef, {
      ...formData,
      photoURL,
      availableSlots,
    });

    setPhoto(null); // Clear the photo state after upload
    setPhotoPreview(photoURL);
    setEditing(false);
  }, [availableSlots, formData, photo, user]);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push('/home');
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="max-w-6xl mx-auto p-0 md:p-8">
        <div className="bg-white rounded-none md:rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 md:px-8 md:py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white md:text-2xl">Profile</h1>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row gap-0 md:gap-6 lg:gap-8">
              {/* Left Column - Profile Photo */}
              <div className="lg:w-1/3 flex flex-col items-center">
                <div className="relative">
                  <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                    <Image fill src={photoPreview || '/placeholder-user.png'} alt="Profile" className="object-cover" />
                  </div>
                  {editing && (
                    <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2">
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer bg-blue-600 w-8 absolute h-8 p-2 bottom-1 right-1 rounded-full text-white hover:bg-blue-700 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </label>
                    </div>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold text-gray-800 md:text-2xl">{`${formData.name} ${formData.surname}`}</h2>
                <p className="text-blue-600 font-medium text-sm md:text-base">{formData.role} Profile</p>
              </div>

              {/* Right Column - Profile Details */}
              <div className="lg:w-2/3">
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 md:mb-2">First Name</label>
                      <div className="relative flex items-center">
                        <User className="absolute left-2 md:left-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!editing}
                          className="w-full pl-8 md:pl-12 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 md:mb-2">Last Name</label>
                      <div className="relative flex items-center">
                        <User className="absolute left-2 md:left-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        <input
                          type="text"
                          name="surname"
                          value={formData.surname}
                          onChange={handleChange}
                          disabled={!editing}
                          className="w-full pl-8 md:pl-12 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 md:mb-2">Phone Number</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-2 md:left-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editing}
                          className="w-full pl-8 md:pl-12 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 md:mb-2">Address</label>
                      <div className="relative flex items-center">
                        <MapPin className="absolute left-2 md:left-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        {editing ? (
                          <div className="w-full">
                            <PlacesAutocomplete
                              setSelectedAddress={(e) => {
                                setFormData((prevFormData) => ({ ...prevFormData, selectedAddress: e }));
                              }}
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            name="city"
                            value={formData.selectedAddress.place_name}
                            onChange={handleChange}
                            disabled={true}
                            className="w-full pl-8 md:pl-12 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-y-4 sm:flex-row sm:gap-x-8">
                  <div className="w-full">
                    <button
                      onClick={() => router.push('/users')}
                      className="flex items-center justify-center px-4 py-3 w-full h-full rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm md:text-base"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Messages
                    </button>
                  </div>
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
                      onClick={() => router.push('/map')}
                      className="flex items-center justify-center px-4 py-3 w-full h-full rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm md:text-base"
                    >
                      <Map className="w-4 h-4 mr-2" />
                      View Map
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-8">
                  <div className="w-full">
                    <button
                      onClick={editing ? handleSave : () => setEditing(true)}
                      className={`flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium ${
                        editing
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition text-sm md:text-base`}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {editing ? 'Save Changes' : 'Edit Profile'}
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
                {formData.role === 'doctor' && (
                  <AvailableTimePicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    availableSlots={availableSlots}
                    setSelectedDate={setSelectedDate}
                    setSelectedTime={setSelectedTime}
                    onUpdateAvailableSlots={handleUpdateAvailableSlots}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
