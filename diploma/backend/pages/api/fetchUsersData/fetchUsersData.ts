import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
interface UserType {
  uid: string;
  name: string;
  surname: string;
  phone: string;
  selectedAddress: {
    coordinates: [number, number];
    id: string;
    place_name: string;
  };
  photoURL: string;
}
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
        photoURL: data.photoURL,
      });
    });

    return userList;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
export default fetchUsersData;
