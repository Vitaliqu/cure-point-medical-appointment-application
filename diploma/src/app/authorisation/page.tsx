'use client';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../../../backend/lib/firebaseConfig';
import { loginUser } from '../../../backend/pages/api/auth/login';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

const AuthForm = () => {
  const router = useRouter(); // Initialize Next.js router

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null | undefined>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error, success } = await loginUser(email, password);
    if (error) {
      setError(error);
    } else {
      setSuccess(success);
    }
  };
  if (user) router.push('/profile'); // Redirect to Profile page

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 text-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-semibold text-center mb-6">Authentication</h2>
      {error && <p className="text-red-400 text-center">{error}</p>}
      {success && <p className="text-green-400 text-center">{success}</p>}
      {!user && (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            Sign In
          </button>
        </form>
      )}
      {!user && (
        <div className="mt-4 text-center">
          <p className="text-sm">Don't have an account?</p>
          <Link href="/register">
            <button className="w-full bg-green-600 text-white p-2 rounded-lg mt-2 hover:bg-green-700">Register</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
