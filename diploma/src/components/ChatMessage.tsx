'use client';

import { FC } from 'react';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';

interface Message {
  text: string;
  participants: string[];
  createdAt: Timestamp | null; // Allow createdAt to be null
}

interface Props {
  message: Message;
  currentUid: string | undefined;
  userName: string | null;
  userPhotoURL: string | null;
}

const ChatMessage: FC<Props> = ({ message, currentUid, userName, userPhotoURL }) => {
  const { text, participants, createdAt } = message;
  const isSentByCurrentUser = participants[0] === currentUid;
  const formattedTime =
    createdAt && createdAt.seconds
      ? new Date(createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Sending...';

  return (
    <div className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isSentByCurrentUser && userPhotoURL && (
        <div className="relative w-10 h-10 mb-3 mr-1 self-end">
          <Image src={userPhotoURL} alt="User Avatar" fill className="rounded-full object-cover" />
        </div>
      )}
      <div className={`flex flex-col max-w-[70%]`}>
        {!isSentByCurrentUser && <p className="text-sm text-gray-600 font-medium mb-1">{userName || 'User'}</p>}
        <div
          className={`px-4 py-2 rounded-2xl text-sm break-words shadow-md ${
            isSentByCurrentUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-black rounded-bl-none'
          }`}
        >
          {text}
        </div>
        <span className={`text-[10px] text-gray-400 mt-1 ${isSentByCurrentUser ? 'text-right' : 'text-left'}`}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
