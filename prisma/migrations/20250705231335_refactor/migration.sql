/*
  Warnings:

  - You are about to drop the column `dateApplied` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `YoungPeople` table. All the data in the column will be lost.
  - You are about to drop the column `contactPerson` on the `YoungPeople` table. All the data in the column will be lost.
  - You are about to drop the column `contactRelationship` on the `YoungPeople` table. All the data in the column will be lost.
  - Added the required column `dateRegistered` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Made the column `gradeLevelId` on table `Registration` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classificationId` on table `Registration` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_classificationId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_gradeLevelId_fkey";

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "dateApplied",
ADD COLUMN     "dateRegistered" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "gradeLevelId" SET NOT NULL,
ALTER COLUMN "classificationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "YoungPeople" DROP COLUMN "contactNumber",
DROP COLUMN "contactPerson",
DROP COLUMN "contactRelationship",
ALTER COLUMN "middleName" DROP NOT NULL,
ALTER COLUMN "suffix" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ContactPersonEmergency" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "relationship" TEXT,
    "contactNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "youngPersonId" TEXT,

    CONSTRAINT "ContactPersonEmergency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactPersonEmergency_youngPersonId_key" ON "ContactPersonEmergency"("youngPersonId");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPersonEmergency" ADD CONSTRAINT "ContactPersonEmergency_youngPersonId_fkey" FOREIGN KEY ("youngPersonId") REFERENCES "YoungPeople"("id") ON DELETE SET NULL ON UPDATE CASCADE;
