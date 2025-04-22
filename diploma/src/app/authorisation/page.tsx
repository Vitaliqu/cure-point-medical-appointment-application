'use client';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react';
import { auth } from '../../../backend/lib/firebaseConfig';
import { loginUser } from '@/app/api/auth/login';
import { useRouter } from 'next/navigation';

function Authorisation() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        router.push('/home');
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error, success } = await loginUser(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccess(success);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 text-center">
            <p className="text-white font-medium text-left text-2xl">Sign in</p>
          </div>

          <div className="p-8">
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg">{error}</div>}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg">{success}</div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" autoComplete="on">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white 
                    ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm flex flex-row justify-center text-gray-600 mb-4">Don&apos;t have an account?</p>
              <p
                onClick={() => router.push('/register')}
                className="flex items-center justify-center px-6 cursor-pointer py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-600">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default Authorisation;
