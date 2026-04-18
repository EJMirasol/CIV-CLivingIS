-- AlterTable
ALTER TABLE "public"."SsotGroupAssignment" ADD COLUMN     "gender" "public"."Gender",
ADD COLUMN     "gradeLevelId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."SsotGroupAssignment" ADD CONSTRAINT "SsotGroupAssignment_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "public"."GradeLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
