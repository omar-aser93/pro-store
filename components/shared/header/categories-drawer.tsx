import Link from 'next/link';
import { getAllCategories } from '@/lib/actions/product.actions';
import { MenuIcon } from 'lucide-react';                   //icons lib auto installed with shadcn
//shadcn components
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
  

//categories Drawer component
const CategoriesDrawer = async () => {

const categories = await getAllCategories();      //get products Categories server-action
return (
  <Drawer direction='left'>
    <DrawerTrigger asChild><Button variant='outline'> <MenuIcon /> </Button></DrawerTrigger>
    <DrawerContent className='h-full max-w-sm'>
      <DrawerHeader>
        <DrawerTitle>Select a category</DrawerTitle>
        <div className='space-y-1'>
          {/* Map over categories & render a button for each category. The `DrawerClose` component when clicked
             is used to close the drawer but also navigates to the filtered page we want */}
          {categories.map((x) => ( 
          <Button className='w-full justify-start' variant='ghost' key={x.category} asChild >
            <DrawerClose asChild><Link href={`/search?category=${x.category}`}>{x.category} ({x._count}) </Link></DrawerClose>
          </Button> ))}
        </div>
        </DrawerHeader>
    </DrawerContent>
  </Drawer>
  );
};

export default CategoriesDrawer;