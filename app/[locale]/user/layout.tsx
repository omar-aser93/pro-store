import Image from 'next/image';
import Link from 'next/link';
import ProfileNav from '@/components/profile-nav';
import Menu from '@/components/shared/header/menu';


//Layout we created for user route pages
export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className='flex flex-col'>
        {/* Header */}
        <div className='border-b container mx-auto'>
          <div className='flex h-16 items-center px-4'>
            {/* Logo */}
            <Link href='/' className='w-22'> <Image src='/images/logo.svg' width={48} height={48} alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`}  /> </Link>
            {/* User_pages Nav component */}
            <ProfileNav className='mx-6'/>
            {/* Right side Menu (reused component) */}
            <div className='ltr:ml-auto rtl:mr-auto flex items-center space-x-4'> <Menu /> </div>
          </div>
        </div>

        {/* User Pages content */}
        <div className='flex-1 space-y-4 p-8 pt-6 container mx-auto'>
          {children}
        </div>
      </div>
    </>
  );
}