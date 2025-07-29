import { Slot, UserType } from '@/interfaces/interfaces';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../backend/lib/firebaseConfig';

const updateDoctorAvailableSlots = async (
  selectedDoctor: UserType,
  setSelectedDoctor: (selectedDoctor: UserType) => void,
  updatedAvailableSlots: Slot[],
) => {
  try {
    const doctorRef = doc(db, 'users', selectedDoctor.uid);
    await updateDoc(doctorRef, { availableSlots: updatedAvailableSlots });
    if (selectedDoctor && selectedDoctor.uid === selectedDoctor.uid) {
      setSelectedDoctor({ ...selectedDoctor, availableSlots: updatedAvailableSlots });
    }
  } catch (error) {
    console.error('Error updating doctors available slots:', error);
  }
};

export default updateDoctorAvailableSlots;
