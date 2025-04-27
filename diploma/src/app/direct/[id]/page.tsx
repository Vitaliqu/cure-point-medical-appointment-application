'use client';
import React, { useEffect, useRef, useState } from 'react';
import { auth, db } from '../../../../backend/lib/firebaseConfig';
import { and, collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Message } from '@/interfaces/interfaces';
import Chat from '@/components/Chat';

const DirectMessage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [id, setId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

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

  useEffect(() => {
    if (!id || !user) return;

    if (user.uid === id) {
      console.warn("You can't message yourself.");
      router.push('/users');
      return;
    }

    const userRef = doc(db, 'users', id);

    const init = async () => {
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
          and(where('participantsKey', '==', participantsKey), where('appointmentId', '==', null)),
          orderBy('createdAt'),
        );

        return onSnapshot(messagesQuery, (snapshot) => {
          const liveMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
          setMessages(liveMessages);
          setLoading(false);
        });
      } catch (err) {
        console.error(err);
        router.push('/users');
        setLoading(false);
      }
    };

    let unsubFn: (() => void) | undefined;
    init().then((unsub) => {
      unsubFn = unsub;
    });

    return () => {
      if (unsubFn) unsubFn();
    };
  }, [user, id, router]);

  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);
  if (!id) return;
  return (
    <div className="max-w-2xl h-[calc(100dvh-4rem)] max-h-[64rem] mx-auto">
      <Chat
        messages={messages}
        loading={loading}
        user={user}
        recipientId={id}
        userName={userName}
        userPhotoURL={userPhotoURL}
        appointmentId={null}
      />
    </div>
  );
};
export default DirectMessage;
