'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { File } from 'lucide-react';
import { Message } from '@/interfaces/interfaces';

interface Props {
  message: Message;
  currentUid: string | undefined;
  userName: string | null;
  userPhotoURL: string | null;
}

const ChatMessage: FC<Props> = ({ message, currentUid, userName, userPhotoURL }) => {
  const { text, imageUrl, fileUrl, fileName, type, createdAt, senderId } = message;
  const isSentByCurrentUser = senderId === currentUid;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedTime =
    createdAt && createdAt.seconds
      ? new Date(createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Sending...';

  return (
    <>
      <div className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} mb-3 w-full`}>
        {!isSentByCurrentUser && userPhotoURL && (
          <div className="relative w-10 flex-shrink-0 h-10 mb-3 mr-2 self-end rounded-full overflow-hidden shadow">
            <Image src={userPhotoURL} alt="User Avatar" fill className="object-cover" />
          </div>
        )}

        <div className={`flex flex-col max-w-[90%] sm:max-w-[70%]`}>
          {!isSentByCurrentUser && (
            <p className="text-sm text-gray-700 font-medium mb-1 truncate">{userName || 'User'}</p>
          )}

          <div
            className={`px-4 py-3 rounded-xl text-sm break-words shadow-sm ${
              isSentByCurrentUser
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            {type === 'text' && <p>{text}</p>}

            {type === 'image' && imageUrl && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative w-48 h-36 rounded-md overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
              >
                <Image src={imageUrl} alt="Image Message" fill className="object-cover" />
              </button>
            )}

            {type === 'file' && fileUrl && fileName && (
              <p className="flex items-center">
                <File className={'mr-2 md:mr-4'} />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isSentByCurrentUser ? 'text-white' : 'text-blue-500'} text-left underline overflow-hidden text-ellipsis whitespace-nowrap `}
                >
                  {fileName}
                </a>
              </p>
            )}
          </div>

          <span className={`text-[11px] text-gray-500 mt-1 ${isSentByCurrentUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </span>
        </div>
      </div>

      {isModalOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-scroll rounded-lg shadow-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ✕
            </button>
            <div className="p-4">
              <Image
                src={imageUrl}
                alt="Full Image"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessage;
