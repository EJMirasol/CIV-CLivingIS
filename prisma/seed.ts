import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { auth } from "~/lib/auth.server";

const prisma = new PrismaClient();
// Use the same auth configuration as in auth-server.ts

async function main() {
  // Check and create grade levels
  const gradeLevels = [
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "1st Year College",
    "2nd Year College",
    "3rd Year College",
    "4th Year College",
    "Graduate",
  ];

  for (const gradeName of gradeLevels) {
    const existing = await prisma.gradeLevel.findFirst({
      where: { name: gradeName },
    });
    if (!existing) {
      await prisma.gradeLevel.create({
        data: { name: gradeName },
      });
      console.log(`Created grade level: ${gradeName}`);
    }
  }

  // Check and create halls
  const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "Hall 5"];

  for (const hallName of halls) {
    const existing = await prisma.hall.findFirst({
      where: { name: hallName },
    });
    if (!existing) {
      await prisma.hall.create({
        data: { name: hallName },
      });
      console.log(`Created hall: ${hallName}`);
    }
  }

  // Check and create classifications
  const classifications = ["Young People", "Middle Aged", "Working Ones"];

  for (const classificationName of classifications) {
    const existing = await prisma.classification.findFirst({
      where: { name: classificationName },
    });
    if (!existing) {
      await prisma.classification.create({
        data: { name: classificationName },
      });
      console.log(`Created classification: ${classificationName}`);
    }
  }

  // Create a test user using Better Auth's signUp method
  const existingUser = await prisma.user.findFirst({
    where: { email: "brotherellyjohnmirasol@gmail.com" },
  });

  if (!existingUser) {
    try {
      await auth.api.signUpEmail({
        body: {
          name: "Super Admin",
          email: "brotherellyjohnmirasol@gmail.com",
          password: "Password123!",
        },
      });
      console.log("Test user created");
    } catch (error) {
      console.log("Error creating user:", error);
    }
  } else {
    console.log("Admin user already exists");
  }

  console.log("Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
