'use client';
import { guestCartId } from '@/lib/actions/cart.actions';
import { useEffect } from 'react';

//When a user visits the website, this component will create a guest cart id cookie using guestCartId() server-action
//The id will be used in cart() server-actions to create/fetch a cart by this id in the db, allows a guest user to add products to cart without being logged in. 
//when the user sign-up/sign-in his guest cart will be assigned to him (inside signin/signup server-actions)
export default function GuestCartId () {

  useEffect(() => { guestCartId() }, [])        // Call the guestCartId server-action when the component mounts
    
  return null            // This component doesn't render anything
}

