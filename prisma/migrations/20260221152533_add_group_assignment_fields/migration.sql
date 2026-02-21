-- AlterTable
ALTER TABLE "public"."Group" ADD COLUMN     "isAssignmentActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAssignmentDeleted" BOOLEAN NOT NULL DEFAULT false;
