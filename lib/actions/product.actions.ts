'use server';

import { prisma } from '@/db/prisma';                 //import the Prisma client from prisma.ts, the file we created
import { convertToPlainObject } from '../utils';      //utility function to convert Prisma objects to plain js objects
import { revalidatePath } from 'next/cache';          //used to revalidate the cache of a specific path (we use it with POST/PUT/DELETE actions)
import { dealFormSchema, DealFormType, insertProductSchema, Product, updateProductSchema, updateProductType } from '../validator';    //import zod Schemas/types from validator.ts
import { Prisma } from '@prisma/client';


// Get the latest products server-action (used in Home page)
export async function getLatestProducts() {    
  // Get the latest 4 products from the DB, ordered by creation date in descending order
  const data = await prisma.product.findMany({ take: 4, orderBy: { createdAt: 'desc' } });
  return convertToPlainObject(data);                  //res with an array of the products
}



// Get featured products server-action (used in the carousel in the Home page)
export async function getFeaturedProducts() {
  // Get Featured products from the DB, ordered by creation date in descending order (4 items max)
  const data = await prisma.product.findMany({ where: { isFeatured: true }, orderBy: { createdAt: 'desc' }, take: 4 });
  return convertToPlainObject(data);
}



// Get single product by it's slug server-action, used in Product-Details page (slug is unique similar to id but text & more SEO friendly)
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({ where: { slug: slug } });
}



// Get single product by id server-action (used in update a Product page) 
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({ where: { id: productId } });
  return convertToPlainObject(data);
}



// Get all products server-action, receives filters queries + limit & page values for pagination
export async function getAllProducts({query, limit = Number(process.env.NEXT_PUBLIC_PAGE_SIZE), page, category, price, rating, sort }
       :{query: string; limit?: number; page: number; category: string; price?: string; rating?: string; sort?: string;}) {
  
  //(Filter by query) object.. checks if we recieved a search query, then return object contains the filter {key: query_value}  
  const queryFilter: Prisma.ProductWhereInput= query && query !== 'all' ? { name: { contains: query, mode: 'insensitive' } as Prisma.StringFilter} : {};      
  
  //(Filter by category) object.. checks if we recieved a category query, then return object contains the filter {key: category_value}  
  const categoryFilter = category && category !== 'all' ? { category } : {};

  //(Filter by price) object.. checks if we recieved a price query, then return object contains the filter {key: (greater_than/less_than) price_value} 
  const priceFilter: Prisma.ProductWhereInput= price && price !== 'all' ? { price: { gte: Number(price.split('-')[0]), lte: Number(price.split('-')[1]) }} : {};

  //(Filter by rating) object.. checks if we recieved a rating query, then return object contains the filter {key: (greater_than) rating_value}
  const ratingFilter = rating && rating !== 'all' ? { rating: { gte: Number(rating) } } : {};

  // Find & Get all the products from the database using Prisma.findMany()
  const data = await prisma.product.findMany({
    //Apply the filters + Apply sorting based on the received sort query (lowest, highest, rating, newest) 
    where: { ...queryFilter, ...categoryFilter, ...priceFilter, ...ratingFilter },    
    orderBy: sort === 'lowest' ? { price: 'asc' } : sort === 'highest' ? { price: 'desc' } : sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' },                
    skip: (page - 1) * limit,                       //paginate the data, skip (page number) * (items per page)
    take: limit,                                    //take the limit (items per page)
  });

  //get total number of products with the filters applied, to calculate total pages
  const dataCount = await prisma.product.count({where: { ...queryFilter, ...categoryFilter, ...priceFilter, ...ratingFilter }});        
  return { data, totalPages: Math.ceil(dataCount / limit), };     //res with data and the total number of pages
}



// Get All products_categories server-action
export async function getAllCategories() {
  //group the products by category field and count the number of products in each category
  const data = await prisma.product.groupBy({ by: ['category'], _count: true });     
  return data;
}



// Delete Product by id server-action
export async function deleteProduct(id: string) {
  try {
    //get the product by id, if not found, throw an error
    const productExists = await prisma.product.findFirst({ where: { id } });
    if (!productExists) throw new Error('Product not found');

    await prisma.product.delete({ where: { id } });              //delete the product from the DB by id
    revalidatePath('/admin/products');                           //Revalidate admin products page to get fresh data
    return { success: true, message: 'Product deleted successfully' };       //if success, return success message
  } catch {
    return { success: false, message: 'Failed to delete product, try again later' };    //if error, return error message
  }
}



// Create Product server-action, receives a product form data
export async function createProduct(data: Product) {
  try {   
    const product = insertProductSchema.parse(data);        //parse and validate submitted product with Zod schema
    await prisma.product.create({ data: product });         //create the new product in the DB with the parsed data
    revalidatePath('/admin/products');                      //Revalidate admin products page to get fresh data
    return { success: true, message: 'Product created successfully' };      //if success, return success message
  } catch {
    return { success: false, message: 'Failed to create product, try again later' };   //if error, return error message
  }
}



// Update Product server-action, receives a product form data
export async function updateProduct(data: updateProductType) {
  try {   
    const product = updateProductSchema.parse(data);            //parse and validate submitted product with Zod schema
    //get the product by id, if not found, throw an error
    const productExists = await prisma.product.findFirst({ where: { id: product.id } }); 
    if (!productExists) throw new Error('Product not found');
    
    await prisma.product.update({ where: { id: product.id }, data: product });   //update product in the DB with the parsed data
    revalidatePath('/admin/products');                                           //Revalidate admin products page to get fresh data
    return { success: true, message: 'Product updated successfully' };           //if success, return success message
  } catch {
    return { success: false, message: 'Failed to update product, try again later' };    //if error, return error message
  }
}



// get deal of the month server-action
export async function getDeal() {
  // find latest deal by targetDate & return it after parsing & validating it with Zod schema (avoid prisma JSON type error)
  const deal = await prisma.deal.findFirst({ orderBy: { targetDate: "desc" } }); 
  if (!deal) return null; 
  return dealFormSchema.parse(deal);
}



// create/update (deal of the month) server-action (admin), receives the form data
export async function createDeal(data: DealFormType) {
    
  const parsed = dealFormSchema.parse(data);            // Parse and validate the received data with Zod schema
  const existingDeal = await prisma.deal.findFirst();   // Check if a deal already exists

  // If a deal already exists, update it, otherwise create a new one
  if (existingDeal) {    
    await prisma.deal.update({
      where: { id: existingDeal.id },
      data: { titles: parsed.titles, descriptions: parsed.descriptions, imageUrl: parsed.imageUrl, imageLink: parsed.imageLink, buttonLink: parsed.buttonLink, targetDate: parsed.targetDate },
    });
  } else {    
    await prisma.deal.create({
      data: { titles: parsed.titles, descriptions: parsed.descriptions, imageUrl: parsed.imageUrl, imageLink: parsed.imageLink, buttonLink: parsed.buttonLink, targetDate: parsed.targetDate }
    });
  }
}