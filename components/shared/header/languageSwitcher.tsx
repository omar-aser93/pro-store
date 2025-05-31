'use client';

import { createNavigation } from 'next-intl/navigation';
import { locales, localePrefix , defaultLocale} from '@/i18n';
import { useLocale } from 'next-intl';          
import { Globe } from 'lucide-react';           //icons lib auto installed with shadcn
//shadcn components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
  
// Initialize next-intl navigation utilities 
const { useRouter, usePathname } = createNavigation({ locales, localePrefix, defaultLocale });    


//LanguageSwitcher component to switch between supported locales (languages)
export default function LanguageSwitcher() {

  // Define array of the supported locales and their labels
  const localesData = [{ lang: 'en', label: 'English' }, { lang: 'ar', label: 'العربية' }];

  const router = useRouter();                  //next-intl useRouter() hook to navigate between pages
  const pathname = usePathname();              //next-intl usePathname() hook to get the current URL path name
  const currentLocale = useLocale();           //useLocale() hook to get the current locale (language) 

  // Function to handle locale change
  const handleLocaleChange = (locale: string) => {
    if (locale === currentLocale) return;     // If selected locale is the same as current locale, do nothing 
    router.replace(pathname, { locale });     // router.replace to navigate to the new path without adding a new entry in the browser history               
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Button to trigger the dropdown menu, shows the current locale label and globe icon */}
        <Button variant="outline" size="sm" className="flex items-center gap-2 py-5" aria-label="Change language">
          <Globe className="h-4 w-4" /> {localesData.find(L => L.lang === currentLocale)?.label} 
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu content, map through the locales array and create a menu item for each one & pass handleLocaleChange function */}
      <DropdownMenuContent align="end">
        {localesData.map(locale => (
          <DropdownMenuItem key={locale.lang} onClick={() => handleLocaleChange(locale.lang)} className={`cursor-pointer ${ locale.lang === currentLocale && 'font-semibold'}`} >
            {locale.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
