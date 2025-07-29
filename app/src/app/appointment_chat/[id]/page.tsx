'use client';
import React, { useRef, useEffect, useState } from 'react';
import Chat from '@/components/Chat';
import useChatInitializer from '@/../../hooks/useChatInitializer';
import fetchAllAppointmentData from '@/app/api/fetchAllAppointments/fetchAllAppointments';
import { Appointment } from '@/interfaces/interfaces';
import { auth } from '../../../../backend/lib/firebaseConfig';

const Appointment_Chat = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = React.use(params);
  const [fetchedAppointment, setFetchedAppointment] = useState<Appointment | null>(null);
  const { user, messages, userName, userPhotoURL, loading } = useChatInitializer({
    paramsId: resolvedParams.id,
    isAppointmentChat: true,
  });
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      const appointment = await fetchAllAppointmentData(resolvedParams.id);
      if (appointment) setFetchedAppointment(appointment);
    };
    fetchAppointment();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);

  const getRecipientId = (): string | undefined => {
    if (fetchedAppointment && auth.currentUser?.uid) {
      return fetchedAppointment.doctorId === auth.currentUser.uid
        ? fetchedAppointment.patientId
        : fetchedAppointment.doctorId;
    }
    return undefined;
  };

  const recipientId = getRecipientId();
  return (
    <div className="max-w-2xl h-[calc(100dvh-4rem)] overflow-hidden max-h-[64rem] mx-auto mt-10 md:p-4">
      {user && recipientId && (
        <Chat
          messages={messages}
          loading={loading}
          user={user}
          recipientId={recipientId}
          userName={userName}
          userPhotoURL={userPhotoURL}
          appointmentId={resolvedParams.id}
        />
      )}
      <div ref={dummy}></div>
    </div>
  );
};

export default Appointment_Chat;
