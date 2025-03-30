'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';


const TARGET_DATE = new Date('2025-12-20T00:00:00');          // Static target date (replace with desired date)
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
const DealCountdown = () => {
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();      // State to store the time remaining

  useEffect(() => {    
    setTime(calculateTimeRemaining(TARGET_DATE));      // Calculate initial time remaining when the component mounts
    // Set up an interval to update the time remaining every second
    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(TARGET_DATE);    // Calculate time remaining every second
      setTime(newTime);                                       // Update the time remaining state every second
      // Clear when countdown is over
      if ( newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0 ) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);           // Cleanup interval on unmount
  }, []);

  // Render a loading state during hydration
  if (!time) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 my-20'>
        <div className='flex flex-col gap-2 justify-center'>
          <h3 className='text-3xl font-bold'>Loading Countdown...</h3>
        </div>
      </section>
    );
  }

  // If the countdown is over, display fallback UI
  if ( time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0 ) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 my-20'>
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
    <section className='grid grid-cols-1 md:grid-cols-2 my-20'>
      <div className='flex flex-col gap-2 justify-center'>
        <h3 className='text-3xl font-bold'>Deal Of The Month</h3>
        <p> Get ready for a shopping experience like never before with our Deals of the Month! Every purchase comes with exclusive perks and offers,
          making this month a celebration of savvy choices and amazing deals. Don&apos;t miss out! 🎁🛒
        </p>
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
        <Link href='/search' className='px-8 py-4 text-md font-semibold rounded-md bg-slate-950 text-white hover:opacity-80' > View All Products </Link>        
      </div>
      </div>
      {/* product Promotional Image & Link */}
      <div className='flex justify-center'>
        <Link href='/product/polo-classic-pink-hoodie'>
          <Image src='/images/promo.jpg' alt='promotion' width={300} height={200} />
        </Link>
      </div>
    </section>
  );
};


export default DealCountdown;
