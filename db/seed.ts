//seed file to add a sample-data & seed it to the database using PrismaClient 
import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';
import { hash } from '@/lib/encrypt';       // Import the hash function we manually created in encrypt.ts

async function main() {
  const prisma = new PrismaClient();                   // Create a PrismaClient instance
 
  // Delete/clean all prev products/users in the db models before seeding the sample data
  await prisma.product.deleteMany();   
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  //createMany method to seed the sample data to the database, then log a success message
  await prisma.product.createMany({ data: sampleData.products });
  const users = [];
  // Loop through the sample users, hash their passwords, then add them to the users array
  for (let i = 0; i < sampleData.users.length; i++) {
    users.push({ ...sampleData.users[i], password: await hash(sampleData.users[i].password) });
  }
  await prisma.user.createMany({ data: users });
  console.log('Database seeded successfully');
}

main();                //Call the main function 