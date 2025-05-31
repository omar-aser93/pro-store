/*
  Warnings:

  - A unique constraint covering the columns `[newsletterToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newsletterToken" TEXT;

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" UUID NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_newsletterToken_key" ON "User"("newsletterToken");

-- AddForeignKey
ALTER TABLE "Newsletter" ADD CONSTRAINT "Newsletter_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "wishlists_userId_productId_pk" RENAME TO "Wishlist_userId_productId_key";
