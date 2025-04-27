'use client';
import React, { useEffect, useRef, useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import ChatMessage from './ChatMessage';
import { Upload, Paperclip, Send, X } from 'lucide-react';
import { db, storage } from '../../backend/lib/firebaseConfig';
import { ChatProps, Message } from '@/interfaces/interfaces';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div className="p-4">{children}</div>}
    </div>
  );
}

const Chat: React.FC<ChatProps> = ({
  messages: initialMessages,
  loading: initialLoading,
  user,
  recipientId,
  userName,
  userPhotoURL,
  appointmentId,
}) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(initialLoading);
  const dummy = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (tabValue === 0) {
      document.body.style.position = 'fixed';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.position = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [tabValue]);
  useEffect(() => {
    setMessages(initialMessages);
    setLoading(initialLoading);
  }, [initialMessages, initialLoading]);

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
    if (!loading && tabValue === 0) {
      dummy.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading, messages, tabValue]);

  return (
    <div className="flex flex-col shadow-xl">
      <div className="border-b py-3 px-4 flex items-center shadow-sm">
        <h2 className="font-semibold text-lg">Chat with {userName}</h2>
      </div>

      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 focus:outline-none ${tabValue === 0 ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
            onClick={() => setTabValue(0)}
          >
            Chat
          </button>
          <button
            className={`px-4 py-2 focus:outline-none ${tabValue === 1 ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
            onClick={() => setTabValue(1)}
          >
            Media
          </button>
          <button
            className={`px-4 py-2 focus:outline-none ${tabValue === 2 ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
            onClick={() => setTabValue(2)}
          >
            Files
          </button>
        </div>
      </div>

      <TabPanel value={tabValue} index={0}>
        <div
          className={`${file && 'h-[calc(100dvh-18rem)]'} h-[calc(100dvh-16rem)] md:h-[calc(100dvh-20rem)] overflow-y-auto p-4 pb-0`}
          style={{
            scrollbarWidth: 'thin' /* For Firefox */,
            scrollbarColor: '#a0aec0 transparent' /* For Firefox */,
          }}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                currentUid={user?.uid}
                userName={userName}
                userPhotoURL={userPhotoURL}
              />
            ))
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
          <div ref={dummy}></div>
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <div className="grid grid-cols-2 overflow-y-scroll sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {messages.filter((message) => message.type === 'image').length > 0 ? (
            messages
              .filter((message) => message.type === 'image')
              .map((media, index) => (
                <div key={index} className="relative rounded-md shadow-md overflow-hidden">
                  {media.imageUrl && (
                    <Image
                      onClick={() => {
                        setIsModalOpen(true);
                        if (media.imageUrl) setSelectedImageUrl(media.imageUrl);
                        else return;
                      }}
                      src={media.imageUrl}
                      alt={media.fileName || 'Media'}
                      width={200}
                      height={200}
                      className="object-cover cursor-pointer w-full h-full"
                    />
                  )}
                </div>
              ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-full text-gray-500">
              <p>No media files shared yet.</p>
            </div>
          )}
        </div>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <div className="overflow-y-auto p-4 h-full">
          {messages.filter((message) => message.type === 'file').length > 0 ? (
            <ul className="space-y-2">
              {messages
                .filter((message) => message.type === 'file')
                .map((file, index) => (
                  <li key={index} className="bg-gray-100 rounded-md relative p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5 text-gray-500" />
                      {file.fileUrl && (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline left-10 truncate overflow-hidden whitespace-nowrap right-0 absolute"
                        >
                          {file.fileName}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              <p>No files shared yet.</p>
            </div>
          )}
        </div>
      </TabPanel>

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
      {file && (
        <div className="px-4 left-0 right-0 -top-6 py-2 bg-gray-100 border-t flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
          <button onClick={handleRemoveFile} className="text-gray-500 hover:text-red-500 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {tabValue === 0 && (
        <form onSubmit={sendMessage} className="bg-white border-t relative py-3 px-4 flex items-center gap-2 shadow-md">
          <label htmlFor="fileInput" className="text-gray-500 hover:text-blue-500 cursor-pointer">
            <Upload className="h-5 w-5" />
          </label>
          <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Type a message..."
          />

          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-400 flex items-center justify-center"
            disabled={uploadProgress !== null || !user || !recipientId}
          >
            <Send className="h-5 w-5 mt-0.5 mr-0.5" />
          </button>
        </form>
      )}
      {isModalOpen && selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black bg-opacity-80"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative rounded-lg shadow-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-white bg-gray-800 size-8 flex justify-center items-center   hover:bg-black transition-colors z-10 rounded-full p-1"
            >
              ✕
            </button>
            <Image
              src={selectedImageUrl}
              alt="Full Image"
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-auto max-w-screen max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
