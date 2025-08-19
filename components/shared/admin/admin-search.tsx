'use client';
import { Input } from '@/components/ui/input';                 //Shadcn component        
import { useRef, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';


//Admin search bar component, in the admin area work. It will search products on products page, orders on orders and users on users page.
const AdminSearch = () => {

  const pathname = usePathname();                    //usePathname() hook to get current URL path name
  const router = useRouter();                        //useRouter() hook to navigate to a page
  const searchParams = useSearchParams();            //useSearchParams() hook to get URL queries (SearchParams)
  const [queryValue, setQueryValue] = useState(searchParams.get('query') || '');    //state to store the search query value
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);         // Ref to store debounce timer

  //check if the current pathname startsWith '/admin/orders' or '/admin/users' or '/admin/newsletter' or '/admin/chats' or '/admin/products'
  const basePaths = pathname.startsWith('/admin/orders') ? '/admin/orders' 
                    : pathname.startsWith('/admin/users') ? '/admin/users' 
                    : pathname.startsWith('/admin/newsletter') ? '/admin/newsletter' 
                    : pathname.startsWith('/admin/chats') ? '/admin/chats' : '/admin/products' ;

  // function to handle search input with debounce (updates URL after user stops typing for 300ms)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { 
    setQueryValue(e.target.value.trim());                               // Update input state on change
    if (debounceTimer.current) clearTimeout(debounceTimer.current);     // Clear previous timer
    // Set new debounce timer
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());      //create new object of the URL searchParams
      //if input value is not empty, append (?query="input_value") param to the URL searchParams, else remove the param
      if (e.target.value.trim()) { params.set('query', e.target.value.trim()) } else { params.delete('query') }
      router.push(`${basePaths}?${params.toString()}`, { scroll: false });    //push to the needed filtered page
    }, 300);   // Debounce delay (300ms)
  };

  return (
    <Input type='search' placeholder='Search...' value={queryValue} onChange={handleSearch} className='md:w-[100px] lg:w-[300px]' />
  );
};

export default AdminSearch;