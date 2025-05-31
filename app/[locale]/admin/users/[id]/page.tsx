import { Metadata } from 'next';
import { notFound } from 'next/navigation';     //get not-found.tsx we created, from next/navigation (to use it manually)
import { getUserById } from '@/lib/actions/user.actions';
import UserForm from '@/components/shared/admin/user-form';

//set page title to "Update User"
export const metadata: Metadata = {
  title: 'Update User',
};

const UpdateUserPage = async (props: { params: Promise<{ id: string; }> }) => {

  const { id } = await props.params;           //get user id from the url params
  //get the user by id server-action, if not found, return notFound page
  const user = await getUserById(id);          
  if (!user) notFound();  

  return (
    <div className='space-y-8 max-w-lg mx-auto'>
      <h1 className='h2-bold'>Update User</h1>
      <UserForm user={user} />                  {/* UserForm component to update user's data */}
    </div>
  )
}

export default UpdateUserPage