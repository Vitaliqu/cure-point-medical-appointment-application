'use client';
import React, { FC, useEffect, useState } from 'react';
import { User, Heart, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { db, auth } from '../../../backend/lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';

interface UserType {
  uid: string;
  displayName: string;
  photoURL: string;
}

const Users: FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/authorisation');
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        const userList: UserType[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userList.push({
            uid: doc.id,
            displayName: data.name,
            photoURL: data.photoURL || '',
          });
        });

        const currentUser = auth.currentUser;
        if (currentUser !== null) {
          setUsers(userList.filter((user) => user.uid !== currentUser.uid));
        } else {
          setUsers(userList);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Heart className="text-white w-8 h-8" />
                <h1 className="text-xl sm:text-2xl font-bold text-white">Available Doctors</h1>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center text-xl py-2 text-white hover:bg-blue-700 rounded-lg transition"
              >
                <ArrowLeft className="w-8 h-8 sm:w-4 sm:h-4 mr-2" />
                Back to Profile
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No doctors found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition cursor-pointer border border-gray-100"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 mx-auto sm:mx-0">
                      <Image fill src={user.photoURL} alt={user.displayName} className="object-cover" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                      <p className="text-sm text-gray-500">Available for consultation</p>
                    </div>
                    <button
                      onClick={() => (window.location.href = `/direct/${user.uid}`)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm w-full sm:w-auto"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
