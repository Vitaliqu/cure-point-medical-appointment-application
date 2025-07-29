import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../backend/lib/firebaseConfig';
import { UserType } from '@/interfaces/interfaces';

const fetchUsersData = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const userList: UserType[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userList.push({
        uid: data.uid,
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        selectedAddress: data.selectedAddress,
        role: data.role,
        photoURL: data.photoURL,
        fields: data.fields,
        availableSlots: data.availableSlots,
      });
    });

    return userList;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
export default fetchUsersData;
