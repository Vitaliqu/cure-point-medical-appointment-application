import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

interface CustomUserData {
  name: string;
  surname: string;
  phone: string;
  selectedAddress: {
    coordinates: [number, number];
    id: string;
    place_name: string;
  };
  role: string;
  photoURL: string;
}

const fetchUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Typecast the fetched data to the expected structure
      return userSnap.data() as CustomUserData;
    } else {
      console.error('User document not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

export default fetchUserData;
