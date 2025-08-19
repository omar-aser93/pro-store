import Link from 'next/link';
import { auth } from '@/auth';
import { signOutUser } from '@/lib/actions/user.actions';
import { getTranslations } from 'next-intl/server';
import { UserIcon, LogOut, Heart} from 'lucide-react';     //icons lib auto installed with shadcn
//shadcn components
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';


//UserButton component, displays the user's dropdown menu
const UserButton = async () => {

  const t = await getTranslations('Header');               //get translation function for (Header)

  //check if user is already signed in with Next_Auth session from auth(), if not, show sign in button
  const session = await auth();  
  if (!session) return ( <Link href="/api/auth/signin"> <Button> <UserIcon/> Sign In</Button> </Link> )
  
  const firstInitial = session?.user?.name?.charAt(0).toUpperCase() ?? '';     //get first initial of user's name
  
  return (
  <div className='flex gap-2 items-center'>
  <DropdownMenu>
    {/* DropdownMenuTrigger, asChild is used with shadcn components that have button/Link child as trigger */} 
    <DropdownMenuTrigger asChild>
      {/* button for the dropdown, it shows the user's first initial */}       
      <div className='flex items-center'>
        <Button variant='ghost' className='relative w-8 h-8 rounded-full ltr:ml-2 rtl:mr-2 flex items-center justify-center bg-gray-300' >
          {firstInitial}
        </Button>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent className='w-56' align='end' forceMount>
      {/*User's name and email info, displayed in a menu label */}
      <DropdownMenuLabel className='font-normal'>
        <div className='flex flex-col space-y-1'>
          <p className='text-sm font-medium leading-none'> {session?.user?.name} </p>
          <p className='text-xs leading-none text-muted-foreground'> {session?.user?.email} </p>
        </div>
      </DropdownMenuLabel>

      {/*User profile & order_history links in a menu items */}
      <DropdownMenuItem>
        <Link className="w-full" href="/user/profile"> {t('profile')} </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link className='w-full' href='/user/orders'> {t('history')} </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link className='w-full flex items-center gap-2' href='/wishlist'> <Heart /> {t('wishlist')} </Link>
      </DropdownMenuItem>

      {/*Admin dashboard link in a menu item, only visible if user is an admin */}
      {session?.user?.role === 'admin' && (
      <DropdownMenuItem>
        <Link className='w-full' href='/admin/overview'> Admin </Link>
      </DropdownMenuItem>
      )}

      {/*Log out menu item */}
      <DropdownMenuItem className='p-0 mb-1'>
        <form action={signOutUser} className='w-full mt-1'>
          <hr className='w-[95%] mx-auto mb-1'/>
          <Button className='w-full py-4 px-2 h-4 justify-start' variant='ghost' >
            <LogOut /> {t('logout')}
          </Button>
        </form>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>)
};

export default UserButton;