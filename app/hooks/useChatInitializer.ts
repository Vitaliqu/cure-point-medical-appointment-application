'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { UserType, Message, UseChatInitializerProps, UseChatInitializerResult } from '@/interfaces/interfaces';
import { auth } from '../backend/lib/firebaseConfig';
import fetchUserData from '@/app/api/fetchUserData';
import fetchMessages from '@/app/api/fetchMessages';
import fetchAppointments from '@/app/api/fetchAllAppointments/fetchAllAppointments';

const useChatInitializer = ({ paramsId, isAppointmentChat }: UseChatInitializerProps): UseChatInitializerResult => {
  const [user, setUser] = useState<User | null>(null);
  const [receiver, setReceiver] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    if (!paramsId || !user) return;

    const initChat = async () => {
      let receiverId: string | null = null;

      if (isAppointmentChat) {
        const appointment = await fetchAppointments(paramsId);
        if (appointment) {
          receiverId = appointment.doctorId === user.uid ? appointment.patientId : appointment.doctorId;
        }
      } else {
        receiverId = paramsId;
        if (user.uid === receiverId) {
          console.warn("You can't message yourself.");
          router.push('/users');
          return;
        }
      }

      if (!receiverId) return;

      const userData = await fetchUserData(receiverId);
      if (!userData) {
        console.warn('User does not exist.');
        router.push('/users');
        return;
      }

      setReceiver(userData);
      setUserName(userData.name || null);
      setUserPhotoURL(userData.photoURL || null);

      return fetchMessages({
        appointmentId: isAppointmentChat ? paramsId : null,
        currentUserId: user.uid,
        receiverId: receiverId,
        onMessagesUpdate: (msgs) => {
          setMessages(msgs);
          setLoading(false);
        },
      });
    };

    let unsubscribeMessages: (() => void) | undefined;
    initChat().then((unsubscribe) => {
      unsubscribeMessages = unsubscribe;
    });

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [user, paramsId, isAppointmentChat, router]);

  return { user, receiver, messages, userName, userPhotoURL, loading };
};

export default useChatInitializer;
