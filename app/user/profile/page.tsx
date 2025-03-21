import { Metadata } from 'next';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';   //Next-auth SessionProvider used to wrap & provide session functions
import ProfileForm from './profile-form';

//set page title to "Shipping Address"
export const metadata: Metadata = {
  title: 'Profile',
};


//profile page, allows users to update their profile information
const ProfilePage = async () => {
  
  //Fetch the current user's session (NextAuth)
  const session = await auth();    
  
  return (
    // wrap the component with NextAuth (SessionProvider), so we can use useSession() hook in the client-component
    <SessionProvider session={session}>
      <div className='max-w-md  mx-auto space-y-4'>
        <h2 className='h2-bold'>Profile</h2>
        {session?.user?.name}
        <ProfileForm />
      </div>      
    </SessionProvider>
  );
};

export default ProfilePage