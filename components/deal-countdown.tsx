'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';                        //next-intl hook to get current locale
import { Skeleton } from "@/components/ui/skeleton"           //shadCN skeleton component
import { DealFormType } from '@/lib/validator';

// Function to calculate time remaining (computes the difference between the target date and the current time)
const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};


// DealCountdown is a component that will display a deal countdown timer
const DealCountdown = ({ data }: { data: DealFormType }) => {
    
  const locale = useLocale();                                // useLocale() hook to get the current locale  
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining> | null>(null);   // State to store remaining time 
  
  useEffect(() => {    
    setTime(calculateTimeRemaining(data.targetDate));            // Calculate initial time remaining when the component mounts
    // Set up an interval to update the time remaining every second
    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(data.targetDate);   // Calculate time remaining every second
      setTime(newTime);                                          // Update the time remaining state every second
      // Clear when countdown is over
      if ( newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0 ) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);           // Cleanup function to clear the interval on unmount
  }, [data.targetDate]);


  // Helper function to get localized text, used to get localized title and description, we pass (items[] & locale)
  const getLocalizedText = (items: { lang: string; content: string }[], locale: string) => {
    const item = items.find(i => i.lang === locale);           // Find the item with the matching locale
    return item ? item.content : items[0]?.content || '';      // Return the content if found, otherwise return the first content
  };

  // Render a shadCN loading skeleton during hydration
  if (!time) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 !my-16'>
        {/* Left Text Content Skeleton */}
        <div className='flex flex-col gap-4 justify-center px-4 '>
          <Skeleton className='h-8 w-1/2' />                            {/* Title skeleton */}
          <Skeleton className='h-32 w-full' />                          {/* Paragraph skeleton */}
          <div className='flex justify-center items-center my-3'>
            <Skeleton className='h-12 w-48 rounded-md' />               {/* Button skeleton */}
          </div>
        </div>  
        {/* Right Image Skeleton */}
        <div className='flex justify-center items-center px-4'>
          <Skeleton className='h-[200px] w-[300px] rounded-md' />
        </div>
      </section>
    );
  }

  // If the countdown is over, display fallback UI (Deal not available)
  if ( time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0 ) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 !my-16'>
        <div className='flex flex-col gap-2 justify-center'>
          <h3 className='text-3xl font-bold'>Deal Has Ended</h3>
          <p> This deal is no longer available. Check out our latest promotions! </p>
          {/* Link to All Products (filtering) page */}
          <div className='flex justify-center items-center my-8'>
            <Link href='/search' className='px-8 py-4 text-md font-semibold rounded-md bg-slate-950 text-white hover:opacity-80' > View All Products </Link>        
          </div>
        </div>
        <div className='flex justify-center'>
          <Image src='/images/promo.jpg' alt='promotion' width={300} height={200} />
        </div>
      </section>
    );
  }

  return (
    <section className='grid grid-cols-1 md:grid-cols-2 !my-16'>
      <div className='flex flex-col gap-2 justify-center'>
        <h3 className='text-3xl font-bold'>{getLocalizedText(data.titles, locale) }</h3>
        <p> {getLocalizedText(data.descriptions, locale)} </p>
        {/* Countdown Timer */}
        <ul className='grid grid-cols-4'>
          <li className='p-4 w-full text-center'>
            <p className='text-3xl font-bold'>{time.days}</p>  
            <p>{'Days'}</p> 
          </li>
          <li className='p-4 w-full text-center'>
            <p className='text-3xl font-bold'>{time.hours}</p>  
            <p>{'Hours'}</p> 
          </li>
          <li className='p-4 w-full text-center'>
            <p className='text-3xl font-bold'>{time.minutes}</p>  
            <p>{'Minutes'}</p> 
          </li>
          <li className='p-4 w-full text-center'>
            <p className='text-3xl font-bold'>{time.seconds}</p>  
            <p>{'Seconds'}</p> 
          </li>
        </ul>
        {/* Link to All Products (filtering) page */}
        <div className='flex justify-center items-center my-8'>
          <Link href={data.buttonLink}  className='px-8 py-4 text-md font-semibold rounded-md bg-slate-950 text-white hover:opacity-80' > View The Products </Link>        
        </div>
      </div>
      {/* product Promotional Image & Link */}
      <div className='flex justify-center'>
        <Link href={data.imageLink ?? '/search'} className='hover:opacity-80 hover:scale-105' target='_blank'>
          <Image src={data.imageUrl} alt={getLocalizedText(data.titles, locale)} width={300} height={200} />
        </Link>
      </div>
    </section>
  );
};


export default DealCountdown;
