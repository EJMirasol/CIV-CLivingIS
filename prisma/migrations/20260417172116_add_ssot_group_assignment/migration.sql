-- CreateTable
CREATE TABLE "public"."SsotGroupAssignment" (
    "id" TEXT NOT NULL,
    "ssotRegistrationId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SsotGroupAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SsotGroupAssignment_ssotRegistrationId_groupId_key" ON "public"."SsotGroupAssignment"("ssotRegistrationId", "groupId");

-- AddForeignKey
ALTER TABLE "public"."SsotGroupAssignment" ADD CONSTRAINT "SsotGroupAssignment_ssotRegistrationId_fkey" FOREIGN KEY ("ssotRegistrationId") REFERENCES "public"."SsotRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SsotGroupAssignment" ADD CONSTRAINT "SsotGroupAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
