import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../backend/lib/firebaseConfig';
import { Message } from '@/interfaces/interfaces';
import uploadFile from './useFileUpload';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import { encryptText } from '../backend/utils/crypto';

const sendMessage = async (
  event: FormEvent<HTMLFormElement>,
  input: string,
  setInput: Dispatch<SetStateAction<string>>,
  userId: string,
  recipientId: string,
  appointmentId: string | null,
  file: File | null,
  setUploadProgress: Dispatch<SetStateAction<number | null>>,
  setFile: Dispatch<SetStateAction<File | null>>,
) => {
  event.preventDefault();
  if (!userId || !recipientId) return;

  try {
    if (input.trim()) {
      const messagePayload: Message = {
        text: encryptText(input.trim()),
        type: 'text',
        participants: [userId, recipientId],
        participantsKey: [userId, recipientId].sort().join('_'),
        createdAt: Timestamp.fromDate(new Date()),
        appointmentId: appointmentId || null,
        senderId: userId,
      };
      await addDoc(collection(db, 'directMessages'), messagePayload);
      setInput('');
    }

    if (file) {
      await uploadFile(file, userId, recipientId, appointmentId, setUploadProgress, setFile);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export default sendMessage;
