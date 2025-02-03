'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';             //import the cn utility function to conditionally apply classes
import { useState } from 'react';

// ProductImages component to display the product images, we receive the images string_array as props
const ProductImages = ({ images }: { images: string[] }) => {

  //State to keep track of current large_image index, default is the 1st img (index = 0) 
  const [current, setCurrent] = useState(0);       
  return (
    <div className='space-y-4'>
      <Image src={images![current]} alt='hero image' width={1000} height={1000} className='min-h-[300px] object-cover object-center ' />
      <div className='flex'>
        {/* map through imgs & Display them as thumbnails but highlight 1 image onclick, as we set it in current state */}
        {images.map((image, index) => (
          <div key={image} className={cn('border mr-2 cursor-pointer hover:border-orange-600', current === index && '  border-orange-500' )}
               onClick={() => setCurrent(index)} >
            <Image src={image} alt={'image'} width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;