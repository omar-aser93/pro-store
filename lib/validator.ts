//zod validation file. we use it to validate data before inserting it to the db, also to create a TS types for our data.
import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

//Zod Schema for validating inserting a product
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(3, 'Category must be at least 3 characters'),
  brand: z.string().min(3, 'Brand must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  stock: z.coerce.number(),              //coerce.number() to convert string values to number
  images: z.array(z.string()).min(1, 'Product must have at least one image'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),         //nullable() to allow null values for (optional) fields
  price: z.string().refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), 'Price must have exactly two decimal places (e.g., 49.99)'),
});
//We use `z.infer` to create a product TS type & include all fields of the Schema + other fields not included in the form
export type Product = z.infer<typeof insertProductSchema> & { 
    id: string; 
    createdAt: Date; 
    rating: string;             //it's decimal in the db, but we set it to string because TS doesn't have a decimal type
    numReviews: number; 
};


//Zod Schema for validating signing in a user
export const signInFormSchema = z.object({
  email: z.string().email('Invalid email address').min(3, 'Email must be at least 3 characters'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
});
//We use `z.infer` to create a signIn TS type & include all fields of the Schema + callbackUrl(hidden field we need) in the form
export type signInType = z.infer<typeof signInFormSchema> & { callbackUrl: string };


// Schema for signing up a user
export const signUpFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(3, "Email must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  //.refine() to add a custom validation for passwords matching 
  confirmPassword: z.string().min(3, "Confirm password must be at least 3 characters") })
    .refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"]
});
//We use `z.infer` to create a signUp TS type & include all fields of the Schema + callbackUrl(hidden field we need) in the form
export type signUpType = z.infer<typeof signUpFormSchema> & { callbackUrl: string };