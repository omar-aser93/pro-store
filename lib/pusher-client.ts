import Pusher from 'pusher-js';

// Initialize Pusher client-side with App Keys from .env
export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, 
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,    
  }
);