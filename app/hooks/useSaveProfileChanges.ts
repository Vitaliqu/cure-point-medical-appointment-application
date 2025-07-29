import { Slot, UserType } from '@/interfaces/interfaces';
import { doc, updateDoc } from 'firebase/firestore';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { db, storage } from '../backend/lib/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const useSaveProfileChanges = (
  user: UserType | null,
  formData: UserType,
  photo: File | null,
  availableSlots: Slot[],
  setPhoto: Dispatch<SetStateAction<File | null>>,
  setPhotoPreview: Dispatch<SetStateAction<string>>,
  setEditing: Dispatch<SetStateAction<boolean>>,
) => {
  return useCallback(async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);

    let photoURL = formData.photoURL;

    if (photo) {
      const photoRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(photoRef, photo);
      photoURL = await getDownloadURL(photoRef);
    }

    await updateDoc(userRef, {
      ...formData,
      photoURL,
      availableSlots,
    });

    setPhoto(null);
    setPhotoPreview(photoURL);
    setEditing(false);
  }, [availableSlots, formData, photo, user]);
};

export default useSaveProfileChanges;
