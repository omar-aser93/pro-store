"use client";

import { SearchIcon } from 'lucide-react';                         // icons library auto installed with shadcn 
import SearchSuggestions from './Search-suggestions';
import { useState } from 'react';
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

//Search component for searching products, used in the header/menu-drawer components
const Search = ({ categories }: { categories: { category: string; _count: number }[]}) => {

  //state for search input & selected category, so we can pass them as props to SearchSuggestions component
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* < action='/search' method='GET'>, Submission redirects to '/search', method='GET' to pass the form data as URL queries */}
      <form action='/search' method='GET'>
        <div className='flex w-full max-w-sm items-center mx-auto space-x-2 '>

          {/* Select options for categories, < name='category'> prop will automatically pass 'category?' as a URL query on submit */}
          <Select name='category' onValueChange={(e) => setCategory(e)}>
            <SelectTrigger><SelectValue placeholder='All' /></SelectTrigger>
            <SelectContent>
              <SelectItem key={'All'} value={'all'}> All </SelectItem>    {/* Default 'All' option to select all categories */}
              {/* Map over received fetched categories & render a SelectItem for each category */}
              {categories.map((x) => (
                <SelectItem key={x.category} value={x.category}> {x.category} </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search input field, < name='q'> prop will automatically pass 'q?' as a URL query on submit */}
          <Input name='q' type='text' placeholder='Search...' onChange={(e) => setQuery(e.target.value)} className='md:w-[100px] lg:w-[300px] rtl:!mr-1' autoComplete='off' />

          {/* Search button */}
          <Button> <SearchIcon /> </Button>
        </div>
      </form>

      {/* Search suggestions component, receives the search input & selected category as props */}
      <SearchSuggestions query={query} category={category} />
    </div>
  );
};

export default Search;