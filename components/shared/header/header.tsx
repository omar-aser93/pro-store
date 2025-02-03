import Image from 'next/image';
import Link from 'next/link';
import Menu from './menu';

//Header & nav component: contains logo , Search component & Menu component
const Header = () => {
  return (
    <header className='w-full border-b'>
      <div className='wrapper flex-between'>
        {/* Logo */}
        <div className='flex-start'>
          <Link href='/' className='flex-start'>
            <Image priority={true} src='/images/logo.svg' width={48} height={48} alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`} />
            <span className='hidden lg:block font-bold text-2xl ml-3'> {process.env.NEXT_PUBLIC_APP_NAME} </span>
          </Link>
        </div>
        {/* Menu component */}
        <Menu />
      </div>
    </header>
  );
};

export default Header;