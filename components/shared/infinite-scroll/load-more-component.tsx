'use client';

import { useEffect, useState, useTransition } from 'react';
import { loadMore } from '@/components/shared/infinite-scroll/load-more-action'; 
import { Loader2 } from 'lucide-react';

// Component responsible for loading more items when user scrolls to the bottom of the page, recieving props for filters
const LoadMoreComponent = ({ query, category, price, rating, sort, initialPage, totalPages }: 
     { query?: string; category?: string; price?: string; rating?: string; sort?: string; initialPage: number; totalPages: number; }) => {

  const [page, setPage] = useState(initialPage);               // state to track the current page
  const [items, setItems] = useState<React.ReactNode[]>([]);   // state to store the loaded items
  const [isPending, startTransition] = useTransition();        // useTransition() hook to manage pending state
  const [isLastPage, setIsLastPage] = useState(false);         // state to track if it's the last page

  useEffect(() => {
    const el = document.querySelector('[data-infinite-trigger]');   // Select the element that will trigger loading more items
    if (!el || isLastPage) return;         // return out & Skip loading more items if it's the last page

    // Create an IntersectionObserver to observe when the trigger element is in view
    const observer = new IntersectionObserver(([entry]) => {
      // check If the trigger element is in view and it's not the last page
      if (entry.isIntersecting && !isLastPage) {
        observer.unobserve(entry.target);            // Unobserve the trigger element to prevent multiple triggers
        // Start a new transition & Call the loadMore server function to fetch items
        startTransition(async () => {
          const res = await loadMore({ query, category, price, rating, sort, page });
          // Check if there are more pages, then set last_page state to true as we've reached the end
          if (page >= totalPages) { setIsLastPage(true);}
          // set the loaded items to the state & increment the current page
          setItems((prev) => [...prev, ...(Array.isArray(res.data) ? res.data : [])]);
          setPage((prev) => prev + 1);
        });
      }
    }, { rootMargin: '200px' });               // Trigger when element is 200px from viewport (rootMargin)

    observer.observe(el);                      // Start observing the trigger element

    return () => observer.disconnect();        // Cleanup the observer on component unmount
  }, [page, query, category, price, rating, sort, isLastPage, totalPages]);


  return (
    <>
      {items.map((item, i) => (<div key={i}>{item}</div>))}        {/* Render the loaded items */}
      
      {/* Hidden Trigger element for the IntersectionObserver */}
      <div data-infinite-trigger className="h-1 w-full opacity-0" aria-hidden="true" /> 
  
      {/* display a Loader when loading more items */}
      {isPending && !isLastPage && <div className="my-4 flex items-center justify-center gap-2"> 
        <Loader2 className="animate-spin" /> Loading...
      </div>}
  
      {/* Display a message when there are no more products to load */}
      {isLastPage && <div className="my-4 text-center text-gray-500">No more products to load.</div>}
    </>
  );
}

export default LoadMoreComponent;
