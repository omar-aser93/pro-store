//zod validation file. we use it to validate data before inserting it to the db, also to create a TS types for our data.
import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

//Define currency variable that will be used in some of our zod schemas, it refines value to ensure it has exactly 2 decimal places (e.g., 49.99)
const currency = z.string().refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), 'Price must have exactly two decimal places'
);

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
  price: currency
});
//We use `z.infer` to create a product TS type & include all fields of the Schema + other fields not included in the form
export type Product = z.infer<typeof insertProductSchema> & { 
    id: string; 
    createdAt: Date; 
    rating: string;             //it's decimal in the db, but we set it to string because TS doesn't have a decimal type
    numReviews: number; 
};


// Zod Schema for validating updating a product (it inherits all insertProductSchema items & extends it with id field)
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, 'Id is required'),
});
//We use `z.infer` to create an updateProduct TS type
export type updateProductType = z.infer<typeof updateProductSchema>;


//Zod Schema for validating signing in a user
export const signInFormSchema = z.object({
  email: z.string().email('Invalid email address').min(3, 'Email must be at least 3 characters'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
});
//We use `z.infer` to create a signIn TS type & include all fields of the Schema + callbackUrl(hidden field we need) in the form
export type signInType = z.infer<typeof signInFormSchema> & { callbackUrl: string };


//Zod Schema for validating signing up a user
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


// Zod Schema for validating Update Profile 
export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().min(3, 'Email must be at least 3 characters'),
});
//We use `z.infer` to create an updateProfile TS type
export type updateProfileType = z.infer<typeof updateProfileSchema>;


// Zod Schema for validating Update User by admin (it inherits all updateProfileSchema items & extends it with id & role)
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, 'Id is required'),  
  role: z.string().min(1, 'Role is required'),
});
//We use `z.infer` to create an updateUser TS type
export type updateUserType = z.infer<typeof updateUserSchema>;


//Zod Schema for validating Cart Item
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  qty: z.number().int().nonnegative('Quantity must be a non-negative number'),      //.nonnegative() to ensure it's a positive number
  image: z.string().min(1, 'Image is required'),
  price: currency
});
//We use `z.infer` to create a cartItem TS type 
export type cartItemType = z.infer<typeof cartItemSchema>;


//Zod Schema for validating insert Cart
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),                     //array of cartItem Schemas (we created it above this schema)
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart id is required'),
  userId: z.string().optional().nullable(),         //optional when user isn't logged in yet but required at checkout
});
//We use `z.infer` to create a cartItem TS type 
export type Cart = z.infer<typeof insertCartSchema>;


//Zod Schema for validating shipping Address at checkout
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(3, 'city must be at least 3 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().min(3, 'Country must be at least 3 characters'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
//We use `z.infer` to create a shipping Address TS type
export type shippingAddressType = z.infer<typeof shippingAddressSchema>;


//Zod Schema for validating Payment methodes (we defined 3 types of payment methods in the .env file)
export const paymentMethodSchema = z.object({
  type: z.string().min(1, 'Pyament method is required'), })
  .refine((data) => process.env.NEXT_PUBLIC_PAYMENT_METHODS?.split(', ').includes(data.type), { path: ['type'], message: 'Invalid payment method'
  });
//We use `z.infer` to create a payment Method TS type
export type paymentMethodType = z.infer<typeof paymentMethodSchema>;


//Zod Schema for validating inserting an Order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => process.env.NEXT_PUBLIC_PAYMENT_METHODS?.split(', ').includes(data), {
    message: 'Invalid payment method',
  }),
  shippingAddress: shippingAddressSchema,
});
//We use `z.infer` to create an Order TS type
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItem[];
  user: { name: string; email: string };
};


//Zod Schema for validating Order Item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});
//We use `z.infer` to create an OrderItem TS type
export type OrderItem = z.infer<typeof insertOrderItemSchema>;


//Zod Schema for validating paypal payment result
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});
//We use `z.infer` to create a paymentResult TS type
export type paymentResultType = z.infer<typeof paymentResultSchema>;


// Zod Schema for validating Insert a Review 
export const insertReviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  productId: z.string().min(1, 'Product is required'),
  userId: z.string().min(1, 'User is required'),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
});
//We use `z.infer` to create a Review TS type
export type Review = z.infer<typeof insertReviewSchema> & { id: string; createdAt: Date; user?: { name: string }; };


