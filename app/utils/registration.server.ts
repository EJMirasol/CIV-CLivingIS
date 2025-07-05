import type { RegistrationFormDTO } from "~/components/forms/modules/registration/dto/registration.dto";
import { prisma } from "~/lib/prisma";



export async function register(data: RegistrationFormDTO) {
  // Check for duplicate by name + date of birth instead of ID
  const existingApplicant = await prisma.youngPeople.findFirst({
    where: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: new Date(data.dateOfBirth),
    },
  });

  if (existingApplicant) {
    throw new Error("Duplicate");
  }

  // Create BasicHealthInfo first (if provided)
  let basicHealthInfoId;
  if (data.basicHealthInformation) {
    const healthInfo = await prisma.basicHealthInfo.create({
      data: {
        isAllergy: data.basicHealthInformation.isAllergies,
        allergyDescription: data.basicHealthInformation.allergyDescription,
        allergyMedicine: data.basicHealthInformation.allergyMedicine,
        isHealthCondition: data.basicHealthInformation.isHealthCondition,
        healthConditionDescription:
          data.basicHealthInformation.healthConditionDescription,
        healthConditionMedication:
          data.basicHealthInformation.healthConditionMedicine,
      },
    });
    basicHealthInfoId = healthInfo.id;
  }

  // Create YoungPeople with emergency contact
  const youngpeople = await prisma.youngPeople.create({
    data: {
      lastName: data.lastName.trim(),
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      suffix: data.suffix?.trim() || null,
      dateOfBirth: new Date(data.dateOfBirth),
      age: parseInt(data.age, 10),
      gender: data.gender as "brother" | "sister", // Ensure enum match
      image: data.image?.trim() || null,
      ContactPersonEmergency: data.contactPersonEmergency
        ? {
            create: {
              name: data.contactPersonEmergency.name?.trim() || "",
              relationship:
                data.contactPersonEmergency.relationship?.trim() || "",
              contactNumber:
                data.contactPersonEmergency.contactNumber?.trim() || "",
            },
          }
        : undefined,
    },
  });

  // Create Registration record
  await prisma.registration.create({
    data: {
      youngPeopleId: youngpeople.id,
      gradeLevelId: data.gradeLevel, // Use provided gradeLevel ID
      hallId: data.hall,
      classificationId: data.classification,
      remarks: data.remarks?.trim() || "",
      basicHealthInfoId: basicHealthInfoId,
      dateRegistered: new Date(), // Add missing required field
    },
  });

  // Return a value to indicate success for the toaster
  return { success: true, message: "Registration successful." };
}

export async function getAllGradeLevels() {
  const gradeLevels = await prisma.gradeLevel.findMany({
    orderBy: { name: "asc" },
  });

  return gradeLevels.map((level: any) => ({
    label: level.name || "",
    value: level.id || "",
  }));
}

export async function getAllHalls() {
  const halls = await prisma.hall.findMany({
    orderBy: { name: "asc"  },
  });

  return halls.map((hall: any) => ({
    label: hall.name || "",
    value: hall.id || "",
  }));
}

export async function getAllGenders() {
  return [
    { label: "Brother", value: "brother" },
    { label: "Sister", value: "sister" },
  ];
}

export async function getAllClassifications() {
 const classifications = await prisma.classification.findMany({

    orderBy: { name: "asc" },
  });

  return classifications.map((classification: any) => ({
    label: classification.name || "",
    value: classification.id || "",
  }));
}
