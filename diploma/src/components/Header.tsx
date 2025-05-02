'use client';

import { Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../backend/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUserData from '@/app/api/fetchUserData';

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
      try {
        await fetchUserData(currentUser.uid); // assuming photo might be used later
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle the error appropriately, maybe set an error state
      }
    });

    return () => unsubscribe();
  }, []);

  const navItemsConfig = [
    { label: 'Home', path: '/home' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about ' },
  ];

  return (
    <header
      className={`bg-white shadow text-black pt-4 z-50 fixed top-0 left-0 right-0 transition-all overflow-hidden flex flex-col items-start justify-between ${
        isMobileMenuOpen ? 'h-72' : 'h-16'
      } md:h-16`}
    >
      <div className="flex w-full flex-row px-4 md:px-16 items-center justify-between">
        <div onClick={() => router.push('/home')} className="flex  items-center gap-2 cursor-pointer">
          <h1 className="text-xl font-black text-blue-500">Cure Point</h1>
        </div>

        <div className="flex justify-end items-center space-x-4">
          <nav className="hidden justify-center md:flex items-center space-x-6 text-sm lg:text-lg mr-3">
            {navItemsConfig.map(({ label, path }) => (
              <div
                key={label}
                onClick={() => router.push(path)}
                className="cursor-pointer hover:text-blue-500 transition-colors"
              >
                {label}
              </div>
            ))}
            {isAuthenticated ? (
              <div
                onClick={() => router.push('/profile')}
                className="cursor-pointer hover:text-blue-500 transition-colors"
              >
                Profile
              </div>
            ) : (
              <button
                onClick={() => router.push('/authorisation')}
                className="bg-blue-500 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm lg:text-base"
              >
                Book an Appointment
              </button>
            )}
          </nav>
          <button onClick={toggleMobileMenu} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`w-full mt-2 md:hidden bg-white z-10 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        {navItemsConfig.map(({ label, path }) => (
          <button
            key={label}
            onClick={() => {
              router.push(path);
              toggleMobileMenu();
            }}
            className="block w-full text-left px-4 py-3 font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            {label}
          </button>
        ))}
        {isAuthenticated ? (
          <button
            onClick={() => {
              router.push('/profile');
              toggleMobileMenu();
            }}
            className="block w-full text-left px-4 py-3 font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Profile
          </button>
        ) : (
          <button
            onClick={() => {
              router.push('/authorisation');
              toggleMobileMenu();
            }}
            className="block w-full text-left px-4 py-3 font-medium text-sm bg-blue-500 text-white hover:bg-blue-700 transition-colors"
          >
            Book an Appointment
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
