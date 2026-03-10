-- CreateTable
CREATE TABLE "Bag" (
    "id" TEXT NOT NULL,
    "nfcTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "Bag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bag_nfcTagId_key" ON "Bag"("nfcTagId");

-- CreateIndex
CREATE UNIQUE INDEX "Bag_userId_key" ON "Bag"("userId");

-- AddForeignKey
ALTER TABLE "Bag" ADD CONSTRAINT "Bag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
