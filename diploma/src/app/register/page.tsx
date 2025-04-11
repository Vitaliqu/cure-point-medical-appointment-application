'use client';
import React, { useEffect } from 'react';
import { auth } from '../../../backend/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

const RegistrationForm = () => {
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        router.push('/profile'); // Redirect if not logged in
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);
  return (
    <div className="max-w-md mx-auto p-8 mt-10 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Create an Account</h2>
      <div className={'flex-row flex justify-around'}>
        <button
          onClick={() => router.push('/register_user')}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
        >
          Patient
        </button>
        <button
          onClick={() => router.push('/register_doctor')}
          className="w-full ml-4 bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
        >
          Doctor
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
