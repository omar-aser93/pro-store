'use server';
import { prisma } from '@/db/prisma';                 //import the Prisma client from prisma.ts, the file we created
import { convertToPlainObject } from '../utils';      //utility function to convert Prisma objects to plain js objects


// Get the latest products server-action
export async function getLatestProducts() {    
  // Get the latest 4 products, ordered by creation date in descending order
  const data = await prisma.product.findMany({ take: 4, orderBy: { createdAt: 'desc' } });
  return convertToPlainObject(data);                  //res with an array of the products
}


// Get single product by it's slug server-action  (slug is unique similar to id but text & more SEO friendly)
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({ where: { slug: slug } });
}