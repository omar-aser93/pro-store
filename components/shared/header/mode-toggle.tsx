'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';           //next-themes lib for light/dark mode, we use it's useTheme hook 
//Button & dropdown menu components from shadcn
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import { MoonIcon, SunIcon, SunMoon } from 'lucide-react';        //icons lib auto installed with shadcn

const ModeToggle = () => {

  const { theme, setTheme } = useTheme();              //useTheme hook to get/set theme

  //To prevent hydration error, we use a state then check if the component is mounted before the theme is set
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) { return null;}

  return (
  <DropdownMenu>
      {/* ModeToggle button, asChild is usually used with shadcn components that have button/Link child as trigger */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="focus-visible:ring-0 focus-visible:ring-offset-0" >
          {/*get theme & change the icon based on current theme */}  
          {theme === 'system' ? ( <SunMoon /> ) : theme === 'dark' ? ( <MoonIcon /> ) : ( <SunIcon /> )}
        </Button>
      </DropdownMenuTrigger>
      {/* ModeToggle dropdown menu */}
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* ModeToggle items, set theme based on the chosen menu item when onClick */}
        <DropdownMenuCheckboxItem checked={theme === 'system'} onClick={() => setTheme('system')} >
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === 'light'} onClick={() => setTheme('light')} >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === 'dark'} onClick={() => setTheme('dark')} >
          Dark
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>  
  );
};
  
export default ModeToggle;