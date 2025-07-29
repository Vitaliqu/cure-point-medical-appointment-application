import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../backend/lib/firebaseConfig';
import { Appointment } from '@/interfaces/interfaces';

const fetchAllAppointmentData = async (appointmentId: string) => {
  try {
    const userRef = doc(db, 'appointments', appointmentId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as Appointment;
    } else {
      console.error('Appointment document not found');
    }
  } catch (error) {
    console.error('Error fetching appointment data:', error);
  }
};

export default fetchAllAppointmentData;
