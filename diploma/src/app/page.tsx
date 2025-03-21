import { redirect } from 'next/navigation';

const HomePage = () => {
  // Redirect to /authorisation on the home page
  redirect('/authorisation');

  return null; // This will not be rendered due to the redirect
};

export default HomePage;
