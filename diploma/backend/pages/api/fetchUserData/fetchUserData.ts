import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { UserType } from '@/interfaces/interfaces';

const fetchUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserType;
    } else {
      console.error('User document not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

export default fetchUserData;
