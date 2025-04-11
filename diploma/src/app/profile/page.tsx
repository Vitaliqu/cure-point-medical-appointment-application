'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '../../../backend/lib/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import PlacesAutocomplete from '@/components/PlacesAutocomplete/PlacesAutocomplete';
import Image from 'next/image';
import fetchUserData from '../../../backend/pages/api/fetchUserData/fetchUserData'; // Import Image from next/image

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    selectedAddress: { coordinates: [0, 0] as [number, number], id: '', place_name: '' },
    photoURL: '',
  });

  // Listen for authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/authorisation'); // Redirect if not logged in
        return;
      }

      setUser(currentUser);
      const userData = await fetchUserData(currentUser.uid);

      if (userData) {
        setFormData(userData);
        setPhotoPreview(userData.photoURL || null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch user data from Firestore

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle profile update
  const handleSave = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);

    let photoURL = formData.photoURL;

    // Upload new photo if changed
    if (photo) {
      const photoRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(photoRef, photo);
      photoURL = await getDownloadURL(photoRef);
    }

    // Update Firestore
    await updateDoc(userRef, {
      ...formData,
      photoURL,
    });

    setPhotoPreview(photoURL);
    setEditing(false);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/authorisation');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Profile</h2>
      <div className="flex flex-col items-center">
        <Image
          src={photoPreview || '/default-avatar.png'}
          alt="Profile"
          width={128}
          height={128}
          className="rounded-full border border-gray-600 mb-4"
        />
        {editing && <input type="file" accept="image/*" onChange={handlePhotoChange} className="mb-4 w-full text-sm" />}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm">First Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!editing}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm">Surname</label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            disabled={!editing}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editing}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm">City</label>
          {editing ? (
            <PlacesAutocomplete
              setSelectedAddress={(e) => {
                console.log(e);
                formData.selectedAddress = e;
              }}
            />
          ) : (
            <input
              type="text"
              name="city"
              value={formData.selectedAddress.place_name}
              onChange={handleChange}
              disabled={true}
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none"
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        {editing ? (
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 transition p-2 rounded-lg text-white font-semibold"
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 transition p-2 rounded-lg text-white font-semibold"
          >
            Edit Profile
          </button>
        )}
        <button
          onClick={() => router.push('/map')}
          className="bg-green-600 hover:bg-green-700 transition p-2 rounded-lg text-white font-semibold"
        >
          Map
        </button>
        <button
          onClick={() => router.push('/users')}
          className="bg-yellow-600 hover:bg-yellow-700 transition p-2 rounded-lg text-white font-semibold"
        >
          Chat
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 transition p-2 rounded-lg text-white font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
