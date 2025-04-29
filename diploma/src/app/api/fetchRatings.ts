import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../backend/lib/firebaseConfig';
import { Rating } from '@/interfaces/interfaces';

const fetchRatingsData = async () => {
  try {
    const ratingsSnapshot = await getDocs(query(collection(db, 'ratings')));

    if (ratingsSnapshot) {
      return ratingsSnapshot.docs.map((doc) => doc.data() as Rating);
    } else {
      console.error('User document not found');
    }
  } catch (error) {
    console.error('Error fetching ratings data:', error);
  }
};

export default fetchRatingsData;
