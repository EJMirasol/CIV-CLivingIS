import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();
// Use the same auth configuration as in auth-server.ts


async function main() {
  await prisma.gradeLevel.createMany({
    data: [
      { name: "Grade 5" },
      { name: "Grade 6" },
      { name: "Grade 7" },
      { name: "Grade 8" },
      { name: "Grade 9" },
      { name: "Grade 10" },
      { name: "Grade 11" },
      { name: "Grade 12" },
      { name: "1st Year College" },
      { name: "2nd Year College" },
      { name: "3rd Year College" },
      { name: "4th Year College" },
      { name: "Graduate" },
    ],
  });
  await prisma.hall.createMany({
    data: [
      { name: "Hall 1" },
      { name: "Hall 2" },
      { name: "Hall 3" },
      { name: "Hall 4" },
      { name: "Hall 5" },
    ],
  });
  await prisma.classification.createMany({
    data: [
      { name: "Young People" },
      { name: "Middle Aged" },
      { name: "Working Ones" },
    ],
  });

  console.log("Seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
