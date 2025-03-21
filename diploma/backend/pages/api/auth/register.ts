import { setDoc, doc } from 'firebase/firestore';
import { auth, db, storage } from '../../../lib/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface RegisterUserProps {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone: string;
  city: string;
  photo?: File;
}

export const registerUser = async ({ email, password, name, surname, phone, city, photo }: RegisterUserProps) => {
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

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      createdAt: new Date(),
      emailVerified: user.emailVerified,
      name,
      surname,
      phone,
      city,
      photoURL, // Save the uploaded image URL
    });

    // Send email verification
    await sendEmailVerification(user);
    await signOut(auth); // Ensure the user is signed out immediately

    return { success: 'User registered successfully! Please check your email to verify your account.' };
  } catch (err) {
    return { error: (err as Error).message };
  }
};
