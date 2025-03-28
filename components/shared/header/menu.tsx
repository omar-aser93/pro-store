import { EllipsisVertical, ShoppingCart } from 'lucide-react';     //icons lib auto installed with shadcn
import Link from 'next/link';
import ModeToggle from './mode-toggle';
import UserButton from './user-button';
import Search from './search';
//shadcn Button & Sheet components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription} from '@/components/ui/sheet';


//Menu + sm screen drawer/sidebar component: contains logo, mode switch, cart & sign in links
const Menu = () => {
    return (
        <>
        <div className='flex justify-end gap-3'>
          <nav className='md:flex hidden w-full max-w-xs gap-1'>
            <ModeToggle />          {/* ModeToggle component */}
            {/* cart link - asChild is used with shadcn components that have button/Link child as trigger */}
            <Button asChild variant='ghost'>
              <Link href='/cart'> <ShoppingCart /> Cart </Link>
            </Button>
            <UserButton />          {/* UserButton component, for sign in & sign out links */}
          </nav>
          {/* shadcn sheet/Sidebar for sm screens */}
          <nav className='md:hidden'>
            <Sheet>
              <SheetTrigger className='align-middle'> <EllipsisVertical /> </SheetTrigger>
              <SheetContent className='flex flex-col items-start'>
                <SheetTitle>Menu</SheetTitle>
                <div className='my-4'> <Search /> </div>         {/* Search component */}
                <div className='flex justify-around items-center gap-2 w-full'>
                  <ModeToggle />                                 {/* Mode Toggle component */}
                  {/* cart/sign links - asChild is used with shadcn components that have button/Link child as trigger */}
                  <Button asChild variant='ghost'>
                    <Link href='/cart'> <ShoppingCart /> Cart </Link>
                  </Button>
                  <UserButton />            {/* UserButton component, for sign in & sign out links */}
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

