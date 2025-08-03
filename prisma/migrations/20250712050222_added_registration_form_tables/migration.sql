-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Brother', 'Sister');

-- CreateTable
CREATE TABLE "YoungPeople" (
    "id" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "suffix" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "image" TEXT,

    CONSTRAINT "YoungPeople_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "youngPeopleId" TEXT NOT NULL,
    "dateRegistered" TIMESTAMP(3) NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "hallId" TEXT,
    "classificationId" TEXT NOT NULL,
    "remarks" TEXT,
    "basicHealthInfoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GradeLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hall" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BasicHealthInfo" (
    "id" TEXT NOT NULL,
    "isAllergy" BOOLEAN,
    "allergyDescription" TEXT,
    "allergyMedicine" TEXT,
    "isHealthCondition" BOOLEAN,
    "healthConditionDescription" TEXT,
    "healthConditionMedication" TEXT,

    CONSTRAINT "BasicHealthInfo_pkey" PRIMARY KEY ("id")
);

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
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_youngPeopleId_fkey" FOREIGN KEY ("youngPeopleId") REFERENCES "YoungPeople"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_basicHealthInfoId_fkey" FOREIGN KEY ("basicHealthInfoId") REFERENCES "BasicHealthInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPersonEmergency" ADD CONSTRAINT "ContactPersonEmergency_youngPersonId_fkey" FOREIGN KEY ("youngPersonId") REFERENCES "YoungPeople"("id") ON DELETE SET NULL ON UPDATE CASCADE;
