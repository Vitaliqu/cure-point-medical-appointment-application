import { setDoc, doc } from 'firebase/firestore';
import { auth, db, storage } from '../../../../backend/lib/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
type AvailableSlot = {
  date: string; // e.g. "2025-04-15"
  times: string[]; // e.g. ["09:00", "10:30", "14:00"]
};

interface RegisterUserProps {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone: string;
  selectedAddress: { coordinates: [number, number]; id: string; place_name: string };
  photo?: File;
  role: 'patient' | 'doctor';
  fields: string[] | null;
  availableSlots: AvailableSlot[] | null;
}

export const registerUser = async ({
  email,
  password,
  name,
  surname,
  phone,
  selectedAddress,
  photo,
  role,
  fields,
  availableSlots,
}: RegisterUserProps) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let photoURL = '';

    // Upload photo to Firebase Storage if available
    if (photo) {
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(storageRef);
    }

    // Save user data to Firestore, including the user ID (uid)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid, // Store the user ID
      email: user.email,
      createdAt: new Date(),
      emailVerified: user.emailVerified,
      name,
      surname,
      phone,
      selectedAddress,
      photoURL, // Save the uploaded image URL
      role,
      fields,
      availableSlots,
    });

    // Send email verification
    await sendEmailVerification(user);
    await signOut(auth); // Ensure the user is signed out immediately

    return { success: 'User registered successfully! Please check your email to verify your account.' };
  } catch (err) {
    return { error: (err as Error).message };
  }
};
