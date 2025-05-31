'use client';
import { Calendar, User } from 'lucide-react';          //icons library auto installed by shadcn
import { formatDateTime } from '@/lib/utils';           //utility function to format date & time
import Rating from '@/components/shared/product/rating';
import { Review } from '@/lib/validator';
import DeleteDialog from '@/components/shared/delete-dialog';  
import { deleteReview } from '@/lib/actions/review.actions';  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';  //shadcn component


//ReviewList component, to display the reviews of a product 
const ReviewList = ({ reviews, userId }: { reviews: Review[], userId: string }) => {
  return (
    <div className='flex flex-col gap-3'>
      {/* Map through the received reviews array, and display the data of each review inside a card */}
      {reviews.map((review) => (
      <Card key={review.id}>
        <CardHeader>
          <div className='flex-between'>
            <CardTitle className="flex justify-between items-center w-full">
              {review.title}
              {review.userId === userId && (<DeleteDialog id={review.id} action={deleteReview} /> )}
            </CardTitle>
          </div>
          <CardDescription>{review.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-4 text-sm text-muted-foreground'>
            {/* Rating Component */}
            <Rating value={review.rating} />
            {/* User name, or display 'Deleted User' if the user name is null */}
            <div className='flex items-center'>
              <User className='mr-1 h-3 w-3' />
              {review.user ? review.user.name : 'Deleted User'}
            </div>
            {/* Review Date */}
            <div className='flex items-center'>
              <Calendar className='mr-1 h-3 w-3' />
              {formatDateTime(review.createdAt).dateTime}
            </div>
          </div>
        </CardContent>
      </Card> ))}
  </div>    
  );
};


export default ReviewList;