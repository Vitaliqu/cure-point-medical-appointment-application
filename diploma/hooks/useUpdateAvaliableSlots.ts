import { useCallback, SetStateAction, Dispatch } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/../backend/lib/firebaseConfig';
import { Slot, UserType } from '@/interfaces/interfaces';

const useUpdateAvailableSlots = (
  user: UserType | null,
  setAvailableSlots: Dispatch<SetStateAction<Slot[]>>,
  setSuccessMessage: Dispatch<SetStateAction<string | null>>,
  setErrorMessage: Dispatch<SetStateAction<string | null>>,
): ((updatedSlots: Slot[]) => Promise<void>) => {
  return useCallback(
    async (updatedSlots: Slot[]) => {
      if (!user) return;

      setAvailableSlots(updatedSlots);

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          availableSlots: updatedSlots,
        });
        setSuccessMessage('Available slots updated!');
        setErrorMessage(null);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (error) {
        setErrorMessage(`Error updating available slots in Firestore: ${error}`);
        setSuccessMessage(null);
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      }
    },
    [user, setAvailableSlots],
  );
};

export default useUpdateAvailableSlots;
