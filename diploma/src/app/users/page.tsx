'use client';

import { FC, useEffect, useState } from 'react';
import { db, auth } from '../../../backend/lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import the Image component correctly

interface UserType {
  uid: string;
  displayName: string;
  photoURL: string;
}

const UsersList: FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
            photoURL: data.photoURL,
          });
        });

        const currentUser = auth.currentUser;

        if (currentUser !== null) {
          setUsers(userList.filter((user) => user.uid !== currentUser.uid));
        } else {
          setUsers(userList);
        }

        console.log('Fetched users:', userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const startDirectMessage = (uid: string) => {
    router.push(`/direct/${uid}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <button onClick={() => router.push('/profile')} className="bg-blue-500 text-white px-4 py-2 rounded ml-auto">
        Back to Profile
      </button>
      <p className="font-bold mb-4">Users List</p>
      <div className="flex flex-col gap-4">
        {users.length === 0 ? (
          <p>No users available</p>
        ) : (
          users.map((user) => (
            <div key={user.uid} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-3xl relative">
                <Image src={user.photoURL} alt={user.displayName} className={'absolute rounded-full'} fill />
              </div>
              <p>{user.displayName}</p>
              <button
                onClick={() => startDirectMessage(user.uid)}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-auto"
              >
                Message
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersList;
