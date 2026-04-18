-- CreateEnum
CREATE TYPE "public"."MemberType" AS ENUM ('TEAM_LEADER', 'ASSISTANT_TEAM_LEADER', 'MEMBER');

-- AlterTable
ALTER TABLE "public"."Registration" ADD COLUMN     "memberType" "public"."MemberType";

-- AlterTable
ALTER TABLE "public"."SsotGroupAssignment" ADD COLUMN     "memberType" "public"."MemberType";
