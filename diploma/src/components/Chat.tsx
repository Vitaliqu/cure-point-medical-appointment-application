'use client';
import React, { useEffect, useRef, useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import ChatMessage from './ChatMessage';
import { Upload, Paperclip, Send, X } from 'lucide-react';
import { db, storage } from '../../backend/lib/firebaseConfig';
import { ChatProps, Message } from '@/interfaces/interfaces';
import { v4 as uuidv4 } from 'uuid';

const Chat: React.FC<ChatProps> = ({ messages, loading, user, recipientId, userName, userPhotoURL, appointmentId }) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const dummy = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipientId) return;

    if (input.trim()) {
      const messagePayload: Message = {
        text: input.trim(),
        type: 'text',
        participants: [user.uid, recipientId],
        participantsKey: [user.uid, recipientId].sort().join('_'),
        createdAt: Timestamp.fromDate(new Date()),
        appointmentId: appointmentId || null,
        senderId: user.uid,
      };
      try {
        await addDoc(collection(db, 'directMessages'), messagePayload);
        setInput('');
      } catch (error) {
        console.error('Error sending text message:', error);
      }
    }

    if (file) {
      handleFileUpload();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  const handleFileUpload = async () => {
    if (!file || !user || !recipientId) return;

    const fileId = uuidv4();
    const storageRef = ref(storage, `chatFiles/${user.uid}_${recipientId}/${fileId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading file:', error);
        setUploadProgress(null);
        setFile(null);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const messagePayload: Message = {
            type: file.type.startsWith('image/') ? 'image' : 'file',
            [file.type.startsWith('image/') ? 'imageUrl' : 'fileUrl']: downloadURL,
            fileName: file.name,
            participants: [user.uid, recipientId],
            participantsKey: [user.uid, recipientId].sort().join('_'),
            createdAt: Timestamp.fromDate(new Date()),
            appointmentId: appointmentId || null,
            senderId: user.uid,
          };
          await addDoc(collection(db, 'directMessages'), messagePayload);
          setFile(null);
          setUploadProgress(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error getting download URL or sending file message:', error);
          setUploadProgress(null);
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
    );
  };
  useEffect(() => {
    if (!loading) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages]);

  return (
    <div className="flex flex-col shadow-2xl h-full">
      <div className="border-b py-3 px-4 flex items-center shadow-sm">
        <h2 className="font-semibold text-lg">Chat with {userName}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} currentUid={user?.uid} userName={userName} userPhotoURL={userPhotoURL} />
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        <div ref={dummy}></div>
      </div>

      {file && (
        <div className="px-4 py-2 bg-gray-100 border-t flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
          {/* Added file unselect button */}
          <button onClick={handleRemoveFile} className="text-gray-500 hover:text-red-500 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uploading: {Math.round(uploadProgress)}%</span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-2 mt-1">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      <form onSubmit={sendMessage} className="bg-white border-t py-3 px-4 flex items-center gap-2 shadow-md">
        <label htmlFor="fileInput" className="text-gray-500 hover:text-blue-500 cursor-pointer">
          <Upload className="h-5 w-5" />
        </label>
        <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Type a message..."
        />
        {/* Centered the send icon */}
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-400 flex items-center justify-center"
          disabled={uploadProgress !== null || !user || !recipientId}
        >
          <Send className="h-5 w-5 mt-0.5 mr-0.5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
