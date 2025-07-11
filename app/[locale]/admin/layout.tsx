import Image from 'next/image';
import Link from 'next/link';
import AdminNav from '@/components/admin-nav';
import Menu from '@/components/shared/header/menu';
import AdminSearch from '@/components/shared/admin/admin-search';


//Layout we created for admin route pages
export default async function AdminLayout({ children }: { children: React.ReactNode; }) {
  return (
    <>
      <div className='flex flex-col'>
        {/* Header */}
        <div className='border-b container mx-auto'>
          <div className='flex h-16 items-center px-4'>
            {/* Logo */}
            <Link href='/' className='w-22'>
              <Image src='/images/logo.svg' width={48} height={48} alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`} />
            </Link>
            {/* Admin_pages Nav component */}
            <AdminNav className='mx-6' /> 
            <div className='ltr:ml-auto rtl:mr-auto flex items-center space-x-4 '>
              {/* Search component, hidden on small screens & we will set it in the side drawer instead */}
              <div className='hidden md:block'><AdminSearch /></div>
              {/* Right side Menu (reused component) */}
              <Menu />
            </div>
          </div>
        </div>

        {/* Admin Pages content */}
        <div className='flex-1 space-y-4 p-8 pt-6 container mx-auto'>
          {children}
        </div>
      </div>
    </>
  );
}