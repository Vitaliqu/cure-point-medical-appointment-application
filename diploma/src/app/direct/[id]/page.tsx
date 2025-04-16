'use client';
import React, { useEffect, useRef, useState } from 'react';
import { auth, db } from '../../../../backend/lib/firebaseConfig';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import User type from firebase
import { useRouter } from 'next/navigation';
import ChatMessage from '@/components/ChatMessage';
import { Message } from '@/interfaces/interfaces';

const DirectMessage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [id, setId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Use User type from Firebase
  const [messages, setMessages] = useState<Message[]>([]); // Use Message type
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dummy = useRef<HTMLDivElement>(null);

  // Resolve 'id' from params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch messages
  useEffect(() => {
    if (!id || !user) return;

    if (user.uid === id) {
      console.warn("You can't message yourself.");
      router.push('/users');
      return;
    }

    const userRef = doc(db, 'users', id);

    const fetchUserDataAndMessages = async () => {
      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.warn('User does not exist.');
          router.push('/users');
          return;
        }

        const { name, photoURL } = userSnap.data();
        setUserName(name || null);
        setUserPhotoURL(photoURL || null);

        const participantsKey = [user.uid, id].sort().join('_');
        const messagesQuery = query(
          collection(db, 'directMessages'),
          where('participantsKey', '==', participantsKey),
          orderBy('createdAt'),
        );

        return onSnapshot(messagesQuery, (snapshot) => {
          const allMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[]; // Cast the data to Message type
          setMessages(allMessages);
          setLoading(false); // ✅ stop loading once messages are fetched
        });
      } catch (err) {
        console.error(err);
        router.push('/users');
        setLoading(false);
      }
    };

    let unsubscribeFn: (() => void) | undefined;
    fetchUserDataAndMessages().then((unsub) => {
      unsubscribeFn = unsub;
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [user, id, router]); // Add router as a dependency

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !id) return;

    try {
      await addDoc(collection(db, 'directMessages'), {
        text: input.trim(),
        participants: [user.uid, id],
        participantsKey: [user.uid, id].sort().join('_'),
        createdAt: new Date(),
      });
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Scroll to bottom when loading is finished or messages change
  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <button onClick={() => router.push('/users')} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Back to Users List
      </button>
      <p className="font-bold mb-4">Direct Message with {userName}</p>
      <div className="h-[400px] overflow-y-scroll border p-2 pb-0 mb-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              currentUid={auth.currentUser?.uid}
              userName={userName}
              userPhotoURL={userPhotoURL}
            />
          ))
        ) : (
          <p>No messages yet.</p>
        )}

        <div ref={dummy}></div>
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default DirectMessage;
