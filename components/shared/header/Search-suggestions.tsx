"use client";

import { useEffect, useRef, useState } from "react";
import { getSearchSuggestions } from "@/lib/actions/product.actions";
import Link from "next/link";
import Image from "next/image";

// Component to show search suggestions
export default function SearchSuggestions({ query, category }: { query: string; category: string }) {
  // states to hold suggestions and open/close status
  const [suggestions, setSuggestions] = useState<{ id: string; slug: string; name: string; images: string[] }[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);          // ref to manage outside click

  // effect to fetch suggestions
  useEffect(() => {
    let active = true;        // flag to track if component is still mounted
    // fetch suggestions only if query input length > 1             
    if (query.length > 1) {
      // debounce the fetch call by 300ms
      const t = setTimeout(async () => {
        const data = await getSearchSuggestions(query, category);      // get suggestions server-action
        if (active) { setSuggestions(data); setOpen(true); }           // update state only if component is still mounted
      }, 300);
      return () => { active = false; clearTimeout(t); };   // cleanup function to clear timeout and mark component as unmounted
    } else {
      setSuggestions([]);         // if query input length <= 1, clear suggestions
      setOpen(false);             // close suggestions dropdown
    }
  }, [query, category]);

  // effect to close on outside click
  useEffect(() => {
    // function to detect outside click and closes the suggestions dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); }
    };
    document.addEventListener("mousedown", handleClickOutside);                    // add click event listener
    return () => document.removeEventListener("mousedown", handleClickOutside);    // cleanup function
  }, []);

  if (!open || !suggestions.length) return null;       // don't render if not open or no suggestions fetched

  return (
    <div ref={containerRef} className="relative">      
      <ul className="absolute bg-white border rounded-md shadow-md w-full mt-1 z-50">
        {/* map through the fetched suggestions, render each suggestion as a link with (image, name) */}
        {suggestions.map((s) => (
          <li key={s.id} className="hover:bg-gray-100 cursor-pointer text-sm" onClick={() => setOpen(false)}>
            <Link href={`/product/${s.slug}`} className="flex items-center gap-2 border-b p-3">
              <Image src={s.images[0]} alt={s.name} className="w-4 h-4 rounded-full" width={100} height={100} />
              {s.name}
            </Link>
          </li>
        ))}
        {/* "See all results" row */}
        <li className="text-center text-blue-600 hover:bg-gray-100 cursor-pointer text-sm p-3" onClick={() => setOpen(false)}>
          <Link href={`/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`}>
            See all results 
          </Link>
        </li>
      </ul>
    </div>
  );
}
