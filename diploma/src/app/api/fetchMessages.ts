import { db } from '../../../backend/lib/firebaseConfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Message } from '@/interfaces/interfaces';

export const fetchMessages = async (userId1: string, userId2: string): Promise<Message[]> => {
  const participantsKey = [userId1, userId2].sort().join('_');

  const messagesQuery = query(
    collection(db, 'directMessages'),
    where('participantsKey', '==', participantsKey),
    orderBy('createdAt'),
  );

  const snapshot = await getDocs(messagesQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[];
};
