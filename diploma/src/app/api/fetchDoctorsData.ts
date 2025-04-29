import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../backend/lib/firebaseConfig';
import { UserType } from '@/interfaces/interfaces';

const fetchDoctorsData = async () => {
  try {
    const doctorsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'doctor')));

    if (doctorsSnapshot) {
      return doctorsSnapshot.docs.map((doc) => doc.data() as UserType);
    } else {
      console.error('User document not found');
    }
  } catch (error) {
    console.error('Error fetching doctors data:', error);
  }
};

export default fetchDoctorsData;
