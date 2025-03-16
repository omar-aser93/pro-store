import { Metadata } from 'next';
// import { auth } from '@/auth';
// import { redirect } from 'next/navigation';         //redirect similar to useRouter().push() but preferred for server-components

//set page title to "Admin Dashboard"
export const metadata: Metadata = {
  title: 'Admin Dashboard',
};


//admin dashboard page
const AdminDashboardPage = async () => {

  //Fetch the current user's session (NextAuth), redirect non-admin/unauthenticated_users to other pages
  // const session = await auth();
  // if (!session) { redirect("/sign-in"); }
  // if (session.user.role !== "admin") { redirect("/"); }

  return <>Dashboard</>;
};

export default AdminDashboardPage;