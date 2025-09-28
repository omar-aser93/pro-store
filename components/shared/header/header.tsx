import Image from 'next/image';
import Link from 'next/link';
import Menu from './menu';
import CategoriesDrawer from './categories-drawer';
import Search from './search';
import { getAllCategories } from '@/lib/actions/product.actions';

//Header & nav component: contains logo , Search component & Menu component
const Header = async () => {
  const categories = await getAllCategories();         //get all categories server-action, to pass it to Search component
  return (
    <header className='w-full border-b'>
      <div className='wrapper flex-between'>        
        <div className='flex-start'>
          {/* Categories Left Drawer component */}
          <CategoriesDrawer />
          {/* Logo */}
          <Link href='/' className='flex-start ltr:ml-4 rtl:mr-4'>
            <Image priority={true} src='/images/logo.svg' width={48} height={48} alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`} />
            <span className='hidden lg:block font-bold text-2xl ltr:ml-3 rtl:mr-3'> {process.env.NEXT_PUBLIC_APP_NAME} </span>
          </Link>
        </div>          
        {/* Search component, hidden on small screens & we will set it in the side drawer instead */}
        <div className='hidden md:block'> <Search categories={categories} /> </div>
        {/* Menu component */}
        <Menu />
      </div>
    </header>
  );
};

export default Header;