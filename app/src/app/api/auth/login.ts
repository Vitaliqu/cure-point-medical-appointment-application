// utils/login.ts
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../../../backend/lib/firebaseConfig';

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      await signOut(auth); // Prevent login if not verified
      return { error: 'Please verify your email before logging in.' };
    }
    return { success: 'User signed in successfully!' };
  } catch (err) {
    return { error: (err as Error).message };
  }
};
