import { EllipsisVertical, ShoppingCart } from 'lucide-react';     //icons lib auto installed with shadcn
import Link from 'next/link';
import { auth } from '@/auth';
import ModeToggle from './mode-toggle';
import LanguageSwitcher from './languageSwitcher';
import UserButton from './user-button';
import Search from './search';
import AdminSearch from '@/components/shared/admin/admin-search';
import { getMyCart } from '@/lib/actions/cart.actions';
//shadcn Button & Sheet components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';


//Menu + sm screen drawer/sidebar component: contains logo, mode switch, cart & sign in links
const Menu = async () => {
 
  const cart = await getMyCart();    // Get user's cart server-action      
  // Count items (map through received items to get its ids, new Set([...] is data structure that only stores unique values, Array.from(...) to convert the Set back into an array ))
  const itemCount = cart ? Array.from(new Set(cart.items.map(item => item.productId))) : []; 

  //Array of objects for admin pages title & link
  const links = [
    { title: 'Overview', href: '/admin/overview' }, { title: 'Products', href: '/admin/products'}, { title: 'Orders', href: '/admin/orders' }, 
    { title: 'Users', href: '/admin/users' }, { title: 'Newsletter', href: '/admin/newsletter' }, { title: 'Chats', href: '/admin/chats' }
  ]; 
 
  const session = await auth();         // get the current user's session 

  return (
      <>
      <div className='flex justify-end gap-3'>
        <nav className='md:flex hidden w-full max-w-xs gap-1 items-center'>
          <ModeToggle />          {/* ModeToggle component */}
          {/* cart link - asChild is used with shadcn components that have button/Link child as trigger */}
          <Button asChild variant='ghost'>
            <Link href='/cart'> 
              {/* cart icon with a badge for cart items count */}
              <div className='relative'>
                <ShoppingCart className="!w-6 !h-6" />
                {itemCount.length > 0 && (<Badge variant="destructive" className="absolute -top-2 -right-2 px-1 py-0.3 text-xs" > {itemCount.length} </Badge>)}
              </div> 
              Cart 
            </Link>
          </Button>
          <LanguageSwitcher />    {/* LanguageSwitcher component */}
          <UserButton />          {/* UserButton component, for sign in & sign out links */}
        </nav>

        {/* shadcn sheet/Sidebar for sm screens */}
        <nav className='md:hidden'>
          <Sheet>
            <SheetTrigger className='align-middle'> <EllipsisVertical /> </SheetTrigger>
            <SheetContent className='flex flex-col items-start'>
              <SheetTitle>Menu</SheetTitle>
              <div className='my-4'> {session?.user?.role === 'admin' ? <AdminSearch /> : <Search />} </div>         {/* Search component */}
              <div className='flex justify-around items-center gap-2 w-full flex-wrap'>
                <ModeToggle />                                 {/* Mode Toggle component */}
                {/* cart link - asChild is used with shadcn components that have button/Link child as trigger */}
                <Button asChild variant='ghost'>
                  <Link href='/cart'> 
                    {/* cart icon with badge for cart items count */}
                    <div className='relative'>
                      <ShoppingCart className="!w-6 !h-6" />
                      {itemCount.length > 0 && (<Badge variant="destructive" className="absolute -top-2 -right-2 px-1 py-0.3 text-xs" > {itemCount.length} </Badge>)}
                    </div> 
                    Cart 
                  </Link>
                </Button>
                <LanguageSwitcher />      {/* LanguageSwitcher component */}
                <UserButton />            {/* UserButton component, for sign in & sign out links */}

                {/* Admin menu links, only visible if the user is an admin */}
                {session?.user?.role === 'admin' && <div className='w-full flex flex-col justify-start mt-4 gap-4'>
                  <hr />
                  {/* map over the links array and render each link, change link style if the current pathname includes the link href */}    
                  {links.map((item) => (
                    <Link key={item.href} href={item.href}  className='text-md font-medium transition-colors hover:text-primary'>
                      {item.title}
                    </Link>
                  ))}
                </div>}
              </div>
              <SheetDescription></SheetDescription>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
};
  
export default Menu;

