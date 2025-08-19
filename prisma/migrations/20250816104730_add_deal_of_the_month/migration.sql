-- CreateTable
CREATE TABLE "Deal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titles" JSONB NOT NULL,
    "descriptions" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageLink" TEXT,
    "buttonLink" TEXT NOT NULL DEFAULT '/search',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);
