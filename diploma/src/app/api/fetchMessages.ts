import { and, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/../backend/lib/firebaseConfig';
import { Message } from '@/interfaces/interfaces';
import { decryptText } from '../../../backend/utils/crypto';

export default function fetchMessages({
  appointmentId,
  currentUserId,
  receiverId,
  onMessagesUpdate,
}: {
  appointmentId: string | null;
  currentUserId: string;
  receiverId: string;
  onMessagesUpdate: (messages: Message[]) => void;
}) {
  const participantsKey = [currentUserId, receiverId].sort().join('_');
  const messagesQuery = query(
    collection(db, 'directMessages'),
    and(where('participantsKey', '==', participantsKey), where('appointmentId', '==', appointmentId)),
    orderBy('createdAt'),
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const liveMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    onMessagesUpdate(
      liveMessages.map((msg) => ({
        ...msg,
        text: msg.text ? decryptText(msg.text) : '',
        fileUrl: msg.fileUrl ? decryptText(msg.fileUrl) : '',
        imageUrl: msg.imageUrl ? decryptText(msg.imageUrl) : '',
        fileName: msg.fileName ? decryptText(msg.fileName) : '',
      })),
    );
  });
}
