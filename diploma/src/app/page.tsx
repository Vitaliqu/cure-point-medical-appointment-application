import { redirect } from 'next/navigation';

const HomePage = () => {
  redirect('/home');

  return null; // This will not be rendered due to the redirect
};

export default HomePage;
