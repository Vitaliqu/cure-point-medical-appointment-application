import { redirect } from 'next/navigation';

const NotFound = () => {
  // Redirect to /authorisation if a page is not found
  redirect('/authorisation');
  return null; // Prevent rendering of a 404 page
};

export default NotFound;
