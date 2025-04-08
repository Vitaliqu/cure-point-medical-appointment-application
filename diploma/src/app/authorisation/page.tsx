'use client';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../../backend/lib/firebaseConfig';
import { loginUser } from '../../../backend/pages/api/auth/login';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const AuthForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 text-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-semibold text-center mb-6">Authentication</h2>
      {error && <p className="text-red-400 text-center">{error}</p>}
      {success && <p className="text-green-400 text-center">{success}</p>}
      {!user && (
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="email"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 pr-10 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            Sign In
          </button>
        </form>
      )}
      {!user && (
        <div className="mt-4 text-center">
          <p className="text-sm">Do not have an account?</p>
          <Link href="/register">
            <button className="w-full bg-green-600 text-white p-2 rounded-lg mt-2 hover:bg-green-700">Register</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
