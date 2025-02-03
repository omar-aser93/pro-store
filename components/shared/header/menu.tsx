import { EllipsisVertical, ShoppingCart, UserIcon } from 'lucide-react';     //icons lib auto installed with shadcn
//shadcn Button & Sheet components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import Link from 'next/link';
import ModeToggle from './mode-toggle';

//Menu + sm screen drawer/sidebar component: contains logo, mode switch, cart & sign in links
const Menu = () => {
    return (
        <>
        <div className='flex justify-end gap-3'>
          <nav className='md:flex hidden w-full max-w-xs gap-1'>
            <ModeToggle />          {/* ModeToggle component */}
            {/* cart/sign-in links - asChild is used with shadcn components that have button/Link child as trigger */}
            <Button asChild variant='ghost'>
              <Link href='/cart'> <ShoppingCart /> Cart </Link>
            </Button>
            <Button asChild>
              <Link href='/sign-in'> <UserIcon /> Sign In </Link>
            </Button>
          </nav>
          {/* shadcn sheet/Sidebar for sm screens */}
          <nav className='md:hidden'>
            <Sheet>
              <SheetTrigger className='align-middle'> <EllipsisVertical /> </SheetTrigger>
              <SheetContent className='flex flex-col items-start'>
                <SheetTitle>Menu</SheetTitle>
                <ModeToggle />             {/* ModeToggle component */}
                {/* cart/sign links - asChild is used with shadcn components that have button/Link child as trigger */}
                <Button asChild variant='ghost'>
                  <Link href='/cart'> <ShoppingCart /> Cart </Link>
                </Button>
                 <Button asChild>
                  <Link href='/sign-in'> <UserIcon /> Sign In </Link>
                </Button>
                <SheetDescription></SheetDescription>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </>
  );
};
  
export default Menu;

