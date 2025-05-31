import { getAllCategories } from '@/lib/actions/product.actions';
import { SearchIcon } from 'lucide-react';                         // icons library auto installed with shadcn 
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


//Search component for the header, 
const Search = async () => {

  const categories = await getAllCategories();         //get all categories server-action
  return (
    //< action='/search' method='GET'>, Submission redirects to '/search', method='GET' to pass form data as URL queries
    <form action='/search' method='GET'>
      <div className='flex w-full max-w-sm items-center space-x-2'>

        {/* Select options for categories, < name='category'> prop will pass 'category?' as a URL query on submit */}
        <Select name='category'>
          <SelectTrigger className='w-[180px]'><SelectValue placeholder='All' /></SelectTrigger>
          <SelectContent>
            <SelectItem key={'All'} value={'all'}> All </SelectItem>    {/* Default 'All' option to select all categories */}
            {/* Map over fetched categories & render a SelectItem for each category */}
            {categories.map((x) => (
              <SelectItem key={x.category} value={x.category}>
                {x.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search input field, < name='q'> prop will pass 'q?' as a URL query on submit */}
        <Input name='q' type='text' placeholder='Search...' className='md:w-[100px] lg:w-[300px] rtl:!mr-1' />

        {/* Search button */}
        <Button> <SearchIcon /> </Button>
      </div>
    </form>
  );
};

export default Search;