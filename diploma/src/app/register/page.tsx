'use client';
import React, { useState, useEffect } from 'react';
import { Heart, Eye, EyeOff, Mail, MapPin, Lock, Phone, Stethoscope, User, Check } from 'lucide-react';
import Select from 'react-select';
import { onAuthStateChanged, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../../backend/lib/firebaseConfig';
import { registerUser } from '@/app/api/auth/register';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AddressProps } from '@/interfaces/interfaces';

function Register() {
  // Common state
  const [registrationType, setRegistrationType] = useState<'patient' | 'doctor' | null>(null);
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<AddressProps | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [medicalFields, setMedicalFields] = useState<string[]>([]);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) router.push('/home');
    });
    return () => unsubscribe();
  }, [router]);

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

  const handleNext = async () => {
    setError(null);

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
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Invalid email or unable to verify email. Please try again. ${err.message}`);
        } else {
          setError('An unknown error occurred.');
        }
        return;
      }
    }
    if (step === 2 && (!name || !surname)) {
      setError('Please fill in all fields.');
      return;
    }
    if (step === 3 && (!phone || !selectedAddress)) {
      setError('Please fill in all fields.');
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setRegistrationSuccess(false);
    setError(null);
    setSuccess(null);
    if (!photo) {
      setError('Please upload a profile photo.');
      setIsLoading(false);
      return;
    }
    if (!registrationType) {
      setError('Please select a registration type.');
      setIsLoading(false);
      return;
    }
    if (!selectedAddress) {
      setError('Please select a city.');
      setIsLoading(false);
      return;
    }
    const role = registrationType;
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
      availableSlots: null,
    });
    setIsLoading(false);
    if (response.error) {
      setError(response.error || 'An unknown error occurred.');
    } else {
      setSuccess(response.success || 'Registration successful');
      setRegistrationSuccess(true);
      setTimeout(() => router.push('/authorisation'), 3000);
    }
  };
  const renderRegistrationTypeSelection = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          setRegistrationType('patient');
          setStep(1);
        }}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 transition p-4 rounded-lg text-white font-semibold"
      >
        <User className="w-5 h-5" />
        <span>Register as Patient</span>
      </button>
      <button
        onClick={() => {
          setRegistrationType('doctor');
          setStep(1);
        }}
        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 transition p-4 rounded-lg text-white font-semibold"
      >
        <Stethoscope className="w-5 h-5" />
        <span>Register as Doctor</span>
      </button>
    </div>
  );

  const renderRegistrationSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
            >
              Next
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surname</label>
              <input
                type="text"
                placeholder="Enter your surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                required
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
            >
              Next
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="flex gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 mt-0.5 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                required
              />
            </div>
            <div>
              <label className="flex gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 mt-0.5 h-4" />
                City
              </label>
              <PlacesAutocomplete setSelectedAddress={setSelectedAddress} />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
            >
              Next
            </button>
          </div>
        );

      case 4:
        return registrationType === 'doctor' ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Fields</label>
            <Select
              isMulti
              options={medicalFieldsList.map((field) => ({ value: field, label: field }))}
              value={medicalFields.map((field) => ({ value: field, label: field }))}
              onChange={(selectedOptions) => setMedicalFields(selectedOptions.map((option) => option.value))}
              className="mb-4"
            />
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
            >
              Next
            </button>
          </div>
        ) : (
          renderPhotoUpload()
        );

      case 5:
        return registrationType === 'doctor' ? renderPhotoUpload() : null;

      default:
        return null;
    }
  };

  const renderPhotoUpload = () => (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {photoPreview ? (
          <div className="w-32 relative h-32 overflow-hidden rounded-full mb-4 border border-gray-200">
            <Image fill className={'absolute'} src={photoPreview} alt="Profile Preview" />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            No Image
          </div>
        )}
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full p-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          required
        />
      </div>
      <button
        onClick={handleRegister}
        disabled={isLoading || registrationSuccess}
        className={`w-full flex items-center justify-center gap-2 transition p-3 rounded-lg text-white font-semibold ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : registrationSuccess
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isLoading ? (
          'Registering...'
        ) : registrationSuccess ? (
          <>
            <Check className="w-5 h-5" />
            <span>Registration Successful</span>
          </>
        ) : (
          'Complete Registration'
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="bg-gradient-to-r rounded-t-2xl from-blue-600 to-blue-700 px-8 py-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Heart className="text-white w-8 h-8" />
              <h1 className="text-2xl font-bold text-white">MedConnect</h1>
            </div>
            <p className="text-blue-100">{'Create your medical profile'}</p>
          </div>

          <div className="p-8">
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg">{error}</div>}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg">{success}</div>
            )}

            <>
              {registrationType === null ? (
                renderRegistrationTypeSelection()
              ) : (
                <>
                  {renderRegistrationSteps()}
                  {step > 1 && (
                    <button
                      onClick={() => setStep((prev) => prev - 1)}
                      className="w-full bg-gray-100 hover:bg-gray-200 transition p-3 rounded-lg text-gray-700 font-semibold mt-4"
                    >
                      Back
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  router.push('/authorisation');
                }}
                className="w-full flex-row flex justify-center text-center text-sm text-gray-600 hover:text-gray-800 mt-6"
              >
                Already have an account?
                <p className={' ml-1 text-blue-500'}>Sign in</p>
              </button>
            </>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-600">
          By continuing, you agree to our
          <a href="#" className=" ml-1 mr-1 text-blue-600 hover:underline">
            Terms of Service
          </a>
          and
          <a href="#" className="ml-1 text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
