'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';                     //shadcn `cn` utility function for conditional classes


const ProfileNav = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {

  //Array of objects for user pages title & link
  const links = [{ title: "Profile", href: "/user/profile" }, { title: "Orders", href: "/user/orders" }];   
  const pathname = usePathname();             //usePathname() hook to get the current url pathname

  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)} {...props} >
      {/* map over the links array and render each link, change link style if the current pathname includes the link href */}  
      {links.map((item) => (        
      <Link key={item.href} href={item.href} 
            className={cn('text-sm font-medium transition-colors hover:text-primary', pathname.includes(item.href) ? '' : 'text-muted-foreground' )} >
        {item.title}
      </Link>
      ))}
   </nav>
  );
};

export default ProfileNav;