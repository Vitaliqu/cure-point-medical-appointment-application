'use client';
import React, { useEffect, useRef, useState } from 'react';
import { auth, db } from '../../../../backend/lib/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import User type from firebase
import { useRouter } from 'next/navigation';
import { Message, UserType } from '@/interfaces/interfaces';
import Chat from '@/components/Chat';
import fetchUserData from '@/app/api/fetchUserData/fetchUserData';
import fetchAppointments from '@/app/api/fetchAppointments/fetchAppointments';
import { and, collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';

const Appointment_Chat = ({ params }: { params: Promise<{ id: string }> }) => {
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Use User type from Firebase
  const [receiver, setReceiver] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // Use Message type
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setAppointmentId(resolvedParams.id);
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
    if (!appointmentId || !user) return;

    const init = async () => {
      const currentAppointment = await fetchAppointments(appointmentId);
      if (!currentAppointment) return;
      const messageReceiver = await fetchUserData(
        currentAppointment.doctorId === user.uid ? currentAppointment.patientId : currentAppointment.doctorId,
      );
      if (!messageReceiver) return;
      setReceiver(messageReceiver);
      const userRef = doc(db, 'users', messageReceiver.uid);

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

        const participantsKey = [user.uid, messageReceiver.uid].sort().join('_');
        const messagesQuery = query(
          collection(db, 'directMessages'),
          and(where('participantsKey', '==', participantsKey), where('appointmentId', '==', appointmentId)),
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
  }, [user, receiver?.uid, router, appointmentId]);

  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);

  return (
    <div className="max-w-2xl h-[calc(100dvh-4rem)] overflow-hidden max-h-[64rem] mx-auto mt-10 md:p-4">
      <Chat
        messages={messages}
        loading={loading}
        user={user}
        recipientId={receiver?.uid || ''}
        userName={userName}
        userPhotoURL={userPhotoURL}
        appointmentId={appointmentId}
      />
    </div>
  );
};
export default Appointment_Chat;
