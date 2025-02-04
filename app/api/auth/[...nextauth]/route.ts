//nextauth API routes file
import { handlers } from '@/auth';                 //importing the handlers from the auth.ts file
export const { GET, POST } = handlers;             //destructuring the GET and POST API routes