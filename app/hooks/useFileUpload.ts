import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { storage, db } from '../backend/lib/firebaseConfig';
import { Message } from '@/interfaces/interfaces';
import { Dispatch, SetStateAction } from 'react';
import { encryptText } from '../backend/utils/crypto';

const uploadFile = (
  file: File,
  userId: string,
  recipientId: string,
  appointmentId: string | null,
  setUploadProgress: (progress: number | null) => void,
  setFile: Dispatch<SetStateAction<File | null>>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fileRef = ref(storage, `chat_uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        setUploadProgress(null);
        reject(error);
      },
      async () => {
        const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
        const messagePayload: Message = {
          type: file.type.startsWith('image') ? 'image' : 'file',
          imageUrl: file.type.startsWith('image') ? encryptText(fileUrl) : '',
          fileUrl: !file.type.startsWith('image') ? encryptText(fileUrl) : '',
          fileName: encryptText(file.name),
          participants: [userId, recipientId],
          participantsKey: [userId, recipientId].sort().join('_'),
          createdAt: Timestamp.fromDate(new Date()),
          appointmentId: appointmentId || null,
          senderId: userId,
        };
        setFile(null);
        await addDoc(collection(db, 'directMessages'), messagePayload);
        setUploadProgress(null);
        resolve();
      },
    );
  });
};

export default uploadFile;
