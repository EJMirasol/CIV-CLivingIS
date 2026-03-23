-- CreateEnum
CREATE TYPE "public"."Locality" AS ENUM ('CALOOCAN_CITY', 'MALABON_CITY', 'NAVOTAS_CITY', 'VALENZUELA_CITY');

-- CreateEnum
CREATE TYPE "public"."ConferenceType" AS ENUM ('YP_CHURCH_LIVING', 'CAMANAVA_SSOT');

-- CreateTable
CREATE TABLE "public"."SsotRegistration" (
    "id" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "suffix" TEXT,
    "locality" "public"."Locality" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "remarks" TEXT,
    "basicHealthInfoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SsotRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BillingSetting" (
    "id" TEXT NOT NULL,
    "feeType" TEXT NOT NULL,
    "conferenceType" "public"."ConferenceType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FinanceRecord" (
    "id" TEXT NOT NULL,
    "conferenceType" "public"."ConferenceType" NOT NULL,
    "registrationId" TEXT,
    "ssotRegistrationId" TEXT,
    "billingSettingId" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SsotRegistration_basicHealthInfoId_key" ON "public"."SsotRegistration"("basicHealthInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingSetting_feeType_key" ON "public"."BillingSetting"("feeType");

-- AddForeignKey
ALTER TABLE "public"."SsotRegistration" ADD CONSTRAINT "SsotRegistration_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "public"."GradeLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SsotRegistration" ADD CONSTRAINT "SsotRegistration_basicHealthInfoId_fkey" FOREIGN KEY ("basicHealthInfoId") REFERENCES "public"."BasicHealthInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinanceRecord" ADD CONSTRAINT "FinanceRecord_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinanceRecord" ADD CONSTRAINT "FinanceRecord_ssotRegistrationId_fkey" FOREIGN KEY ("ssotRegistrationId") REFERENCES "public"."SsotRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinanceRecord" ADD CONSTRAINT "FinanceRecord_billingSettingId_fkey" FOREIGN KEY ("billingSettingId") REFERENCES "public"."BillingSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
