'use client';
import React, { useRef, useEffect } from 'react';
import Chat from '@/components/Chat';
import useChatInitializer from '@/./../hooks/useChatInitializer';

const DirectMessage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = React.use(params);
  const { user, messages, userName, userPhotoURL, loading, receiver } = useChatInitializer({
    paramsId: resolvedParams.id,
    isAppointmentChat: false,
  });
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);

  if (!resolvedParams.id) return null;

  return (
    <div className="max-w-2xl h-[calc(100dvh-4rem)] overflow-hidden max-h-[64rem] mx-auto mt-10 md:p-4">
      {user && receiver && (
        <Chat
          messages={messages}
          loading={loading}
          user={user}
          recipientId={receiver.uid}
          userName={userName}
          userPhotoURL={userPhotoURL}
          appointmentId={null}
        />
      )}
      <div ref={dummy}></div>
    </div>
  );
};

export default DirectMessage;
