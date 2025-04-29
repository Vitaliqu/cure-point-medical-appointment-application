'use client';
import React, { useRef, useEffect } from 'react';
import Chat from '@/components/Chat';
import useChatInitializer from '@/../../hooks/useChatInitializer';

const Appointment_Chat = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = React.use(params);
  const { user, messages, userName, userPhotoURL, loading } = useChatInitializer({
    paramsId: resolvedParams.id,
    isAppointmentChat: true,
  });
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);

  return (
    <div className="max-w-2xl h-[calc(100dvh-4rem)] overflow-hidden max-h-[64rem] mx-auto mt-10 md:p-4">
      {user && (
        <Chat
          messages={messages}
          loading={loading}
          user={user}
          recipientId={messages[0]?.participants?.find((p) => p !== user.uid) || ''}
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
