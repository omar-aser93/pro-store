'use client';
import { cn } from '@/lib/utils';                   //shadcn `cn` utility function for conditional classes
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const AdminNav = ({ className, ...props}: React.HTMLAttributes<HTMLElement>) => {

  //Array of objects for admin pages title & link
  const links = [
    { title: 'Overview', href: '/admin/overview' }, { title: 'Products', href: '/admin/products'}, { title: 'Orders', href: '/admin/orders' }, 
    { title: 'Users', href: '/admin/users' }, { title: 'Newsletter', href: '/admin/newsletter' }, { title: 'Chats', href: '/admin/chats' }
  ]; 
  const pathname = usePathname();             //usePathname() hook to get the current url pathname

  return (
    <nav className={cn('hidden md:flex items-center rtl:gap-2 space-x-4 lg:space-x-6', className)} {...props} >
      {/* map over the links array and render each link, change link style if the current pathname includes the link href */}    
      {links.map((item) => (
        <Link key={item.href} href={item.href}
              className={cn('text-sm font-medium transition-colors hover:text-primary', pathname.includes(item.href) ? '' : 'text-muted-foreground' )} >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export default AdminNav;