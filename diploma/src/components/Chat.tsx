// components/Chat.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import ChatMessage from './ChatMessage';
import { db } from '../../backend/lib/firebaseConfig';
import { ChatProps } from '@/interfaces/interfaces';

const Chat: React.FC<ChatProps> = ({ messages, loading, user, recipientId, userName, userPhotoURL, appointmentId }) => {
  const [input, setInput] = useState('');
  const dummy = useRef<HTMLDivElement>(null);
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !recipientId) return;

    try {
      await addDoc(collection(db, 'directMessages'), {
        text: input.trim(),
        participants: [user.uid, recipientId],
        participantsKey: [user.uid, recipientId].sort().join('_'),
        createdAt: new Date(),
        appointmentId: appointmentId,
      });
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);

  return (
    <>
      <p className="font-bold mb-4">Direct Message with {userName}</p>
      <div className="h-[400px] overflow-y-scroll border p-2 pb-0 mb-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} currentUid={user?.uid} userName={userName} userPhotoURL={userPhotoURL} />
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
    </>
  );
};

export default Chat;
