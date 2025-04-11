'use client';
import React, { useEffect, useState } from 'react';
import { registerUser } from '../../../backend/pages/api/auth/register';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlacesAutocomplete from '@/components/PlacesAutocomplete/PlacesAutocomplete';
import { auth } from '../../../backend/lib/firebaseConfig';
import { fetchSignInMethodsForEmail, onAuthStateChanged } from 'firebase/auth';
import Select from 'react-select';

interface addressProps {
  id: string;
  place_name: string;
}

const RegistrationForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<addressProps | null>(null);
  const medicalFieldsList = [
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

  const [medicalFields, setMedicalFields] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        router.push('/profile'); // Redirect if not logged in
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleNext = async () => {
    setError(null);

    // Step 1: Validate email and password
    if (step === 1) {
      if (!email || !password) {
        setError('Please fill in all fields.');
        return;
      }

      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          setError('Email is already in use. Please use a different email.');
          return;
        }

        // Save email and password at this stage (if validation passes)
        setEmail(email);
        setPassword(password);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Invalid email or unable to verify email. Please try again. ${err.message}`);
        } else {
          setError('An unknown error occurred.');
        }
        return;
      }
    } else if (step === 2 && (!name || !surname)) {
      setError('Please fill in all fields.');
      return;
    } else if (step === 3 && (!phone || !selectedAddress)) {
      setError('Please fill in all fields.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => setStep((prev) => prev - 1);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleRegister = async () => {
    if (!photo) {
      setError('Please upload a profile photo.');
      return;
    }
    if (!selectedAddress) {
      setError('Please select a city.');
      return;
    }
    const role = 'doctor';
    const response = await registerUser({
      email,
      password,
      name,
      surname,
      phone,
      selectedAddress,
      photo,
      role,
      fields: medicalFields,
    });

    if (response.error) {
      setError(response.error || 'An unknown error occurred.');
    } else {
      setSuccess(response.success || 'Registration successful');
      setTimeout(() => {
        router.push('/authorisation'); // Redirect user to /authorisation
      }, 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-10 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Create an Account</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}

      {step === 1 && (
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="block text-sm mb-1">First Name</label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className="block text-sm mb-1">Surname</label>
          <input
            type="text"
            placeholder="Enter your surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block text-sm mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className="block text-sm mb-1">City</label>
          <PlacesAutocomplete setSelectedAddress={setSelectedAddress} />
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Next
          </button>
        </div>
      )}
      {step === 4 && (
        <div>
          <label className="block text-sm mb-2">Medical Fields (Select one or more)</label>
          <Select
            isMulti
            options={medicalFieldsList.map((field) => ({ value: field, label: field }))}
            value={medicalFields.map((field) => ({ value: field, label: field }))}
            onChange={(selectedOptions) => setMedicalFields(selectedOptions.map((option) => option.value))}
            className="mb-4 text-black"
          />
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Next
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col items-center">
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Profile Preview"
              width={128} // specify width
              height={128} // specify height
              className="w-32 h-32 rounded-full mb-4 border border-gray-600"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 mb-4">
              No Image
            </div>
          )}

          <label className="block text-sm mb-2">Upload Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg mb-4 focus:outline-none"
            required
          />
          <button
            onClick={handleRegister}
            className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Register
          </button>
        </div>
      )}

      {step > 1 && (
        <button
          onClick={handlePrev}
          className="w-full bg-gray-600 hover:bg-gray-700 transition p-3 rounded-lg text-white font-semibold mt-3"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default RegistrationForm;
