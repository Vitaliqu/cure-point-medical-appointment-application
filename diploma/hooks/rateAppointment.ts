import { Appointment, UserType } from '@/interfaces/interfaces';
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../backend/lib/firebaseConfig';
import { Dispatch, SetStateAction } from 'react';

const rateAppointment = async (
  currentUser: UserType,
  setPaymentSuccess: Dispatch<SetStateAction<string | null>>,
  setPaymentError: Dispatch<SetStateAction<string | null>>,

  appointment: Appointment,
  rating: number,
) => {
  if (!currentUser || currentUser.role !== 'patient') {
    console.error('Only patients can rate appointments.');
    return;
  }
  try {
    const existingRatingQuery = query(
      collection(db, 'ratings'),
      where('appointment_id', '==', appointment.id),
      where('patient_id', '==', appointment.patientId),
    );
    const existingRatingSnapshot = await getDocs(existingRatingQuery);

    if (!existingRatingSnapshot.empty) {
      const ratingDoc = existingRatingSnapshot.docs[0].ref;
      await updateDoc(ratingDoc, { rating: rating, created_at: new Date() });
      setPaymentSuccess('Rating updated successfully!');
    } else {
      const ratingData = {
        appointment_id: appointment.id,
        doctor_id: appointment.doctorId,
        patient_id: appointment.patientId,
        rating: rating,
        created_at: new Date(),
      };
      const ratingDocRef = doc(collection(db, 'ratings'));
      await setDoc(ratingDocRef, ratingData);
      setPaymentSuccess('Appointment rated successfully!');
    }
    setTimeout(() => setPaymentSuccess(null), 3000);
  } catch (error) {
    console.error('Error rating appointment:', error);
    setPaymentError('Failed to rate appointment.');
    setTimeout(() => setPaymentError(null), 3000);
  }
};
export default rateAppointment;
