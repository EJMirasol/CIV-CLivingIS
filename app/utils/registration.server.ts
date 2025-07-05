
import type { RegistrationFormDTO } from "~/components/forms/modules/registration/dto/registration.dto";
import { prisma } from "~/lib/prisma";


export async function register(data: RegistrationFormDTO) {
  const applicant = await prisma.registration.findUnique({
    where: {
      Id: true
    },
  });

  if (applicant) {
    throw new Error("Duplicate");
  }
  const youngpeople = await prisma.youngpeople.create({
    data: {
      lastName: data.lastName.trim(),
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || "",
      suffix: data.suffix?.trim() || "",
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      age: data.age.trim(),
      gender: data.gender === "brother" ? "brother" : "sister",
      contactPerson: data.contactPerson.trim(),
      contactRelationship: data.contactRelationship.trim(),
      contactNumber: data.contactNumber.trim(),
      image: data.image.trim(),
    },
  });


  const gradeLevel = await prisma.gradeLevel.findFirst({
    orderBy: { id: "asc" },
  });

  if (!gradeLevel) {
    throw new Error("School year or grade level not found");
  }

  await prisma.registration.create({
    data: {
      gradeLevelId: gradeLevel.id,
      youngPeopleId: youngpeople.id,
      hallId: data.hall,
      classification: data.classification,
      remarks: data.remarks?.trim() || "",
      basicHealthInformation: data.basicHealthInformation
        ? {
            allergies: data.basicHealthInformation.allergies.trim(),
            allergyDescription: data.basicHealthInformation.allergyDescription?.trim() || "",
            allergyMedicine: data.basicHealthInformation.allergyMedicine?.trim() || "",
            healthConditions: data.basicHealthInformation.healthConditions.trim(),
            healthConditionDescription: data.basicHealthInformation.healthConditionDescription?.trim() || "",
            healthConditionMedicine: data.basicHealthInformation.healthConditionMedicine?.trim() || "",
          }
        : undefined,
    },
  });

}

export async function getAllGradeLevels() {
  const gradeLevels = await prisma.gradeLevel.findMany({
    orderBy: { id: "asc" },
  });

  return gradeLevels.map((level: any) => ({
    label: level.label || "",
    value: level.value || "",
  }));
}

export async function getAllHalls() {
  const halls = await prisma.hall.findMany({
    orderBy: { id: "asc" },
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

    orderBy: { id: "asc" },
  });

  return classifications.map((classification: any) => ({
    label: classification.name || "",
    value: classification.id || "",
  }));
}
