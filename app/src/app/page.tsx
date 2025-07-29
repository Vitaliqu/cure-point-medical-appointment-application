import { redirect } from 'next/navigation';
import {Metadata} from 'next'

export const metadata: Metadata ={
  title: 'Cure Point'
}
const HomePage = () => {
  redirect('/home');

  return null; // This will not be rendered due to the redirect
};

export default HomePage;
