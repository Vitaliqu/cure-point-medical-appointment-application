'use client';
import { Heart, Map, MessageCircle, User, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../backend/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) setUser(true);
      else setUser(false);
    });
    return () => unsubscribe();
  });
  return (
    <header className="bg-blue-600 text-white p-4 flex z-50 h-16 items-center justify-between md:flex-row fixed top-0 right-0 left-0">
      <div className="flex items-center space-x-2">
        <Heart className="text-white w-6 h-6" />
        <h1 className="text-xl font-bold text-white">MedConnect</h1>
      </div>
      {/* Mobile Menu Button */}
      {user && (
        <div className="md:hidden relative">
          <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      )}

      {user && (
        <div className="hidden md:flex space-x-4">
          <button
            onClick={() => router.push('/users')}
            className="flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </button>
          <button
            onClick={() => router.push('/map')}
            className="flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm"
          >
            <Map className="w-4 h-4 mr-2" />
            View Map
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </button>
        </div>
      )}
      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="absolute transition-all top-full left-0 right-0 bg-blue-600 shadow-md rounded-b-lg overflow-hidden z-10">
          <button
            onClick={() => {
              router.push('/users');
              toggleMobileMenu();
            }}
            className="block w-full text-left px-4 py-3 font-medium text-white hover:bg-blue-500 transition text-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2 inline-block" />
            Messages
          </button>
          <button
            onClick={() => {
              router.push('/map');
              toggleMobileMenu();
            }}
            className="block w-full text-left px-4 py-3 font-medium text-white hover:bg-blue-500 transition text-sm"
          >
            <Map className="w-4 h-4 mr-2 inline-block" />
            View Map
          </button>
          <button
            onClick={() => {
              router.push('/profile');
              toggleMobileMenu();
            }}
            className="block w-full text-left px-4 py-3 font-medium text-white hover:bg-blue-500 transition text-sm"
          >
            <User className="w-4 h-4 mr-2 inline-block" />
            Profile
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
