-- AlterTable
ALTER TABLE "public"."SsotRegistration" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "isCheckedIn" BOOLEAN NOT NULL DEFAULT false;
