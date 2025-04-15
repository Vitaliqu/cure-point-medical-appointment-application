'use client';

import { Heart, User, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../backend/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUserData from '../../backend/pages/api/fetchUserData/fetchUserData';

const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      await fetchUserData(currentUser.uid); // assuming photo might be used later
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'Services', path: '/profile' },
    { label: 'About', path: '/profile' },
    isAuthenticated ? { label: 'Profile', path: '/profile' } : { label: 'Sign in', path: '/authorisation' },
  ];

  return (
    <header
      className={`bg-white shadow text-black py-4 z-50 fixed top-0 left-0 right-0 transition-all overflow-hidden flex flex-col items-start justify-between ${
        isMobileMenuOpen ? 'h-72' : 'h-16'
      } md:h-16`}
    >
      <div className="flex w-full flex-row px-4 md:px-16 items-center justify-between">
        <div onClick={() => router.push('/home')} className="flex items-center gap-2 cursor-pointer">
          <Heart className="text-blue-500 w-6 h-6" />
          <h1 className="text-xl font-black text-blue-500">MedConnect</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm lg:text-lg">
          {navItems.slice(0, 4).map(({ label, path }) => (
            <div
              key={label}
              onClick={() => router.push(path)}
              className="cursor-pointer hover:text-blue-500 transition-colors"
            >
              {label}
            </div>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {!isAuthenticated && (
            <>
              <div className={'hidden md:flex items-center space-x-4'}>
                <div
                  onClick={() => router.push('/authorisation')}
                  className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                >
                  Sign In
                </div>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-blue-500 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </div>
            </>
          )}
          {isAuthenticated && (
            <>
              <User
                onClick={() => router.push('/profile')}
                className="hidden md:flex size-8 cursor-pointer text-blue-500 hover:text-blue-700 transition-colors"
              />
            </>
          )}{' '}
          <button onClick={toggleMobileMenu} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="w-full mt-5 md:hidden bg-white z-10">
        {navItems.map(({ label, path }) => (
          <button
            key={label}
            onClick={() => {
              router.push(path);
              toggleMobileMenu();
            }}
            className="block w-full text-left px-4 py-3 font-medium text-sm hover:bg-blue-500 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
