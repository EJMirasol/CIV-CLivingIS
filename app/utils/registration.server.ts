import type { Prisma } from "@prisma/client";
import type { RegistrationFormDTO } from "~/components/forms/modules/registration/dto/registration.dto";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";


interface ChurchLivingSearch extends pagination {
  hall: string;
  ypfirstName: string
  gender: string
  classification: string;
  gradeLevel?: string;

  
}

export async function getYPCLLists({
  hall,
  ypfirstName,
  gender,
  classification,
  gradeLevel,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc",
}: ChurchLivingSearch) {
  let orderByDir: Prisma.RegistrationOrderByWithRelationInput = {
    createdAt: "asc",
  };
  switch (sortBy) {
    case "gradeLevel":
      orderByDir = {
        GradeLevel: {
          name: sortOrder,
        },
      };
      break;
    case "ypfirstName":
      orderByDir = {
        YoungPeople: {
          firstName: sortOrder,
        },
      };
      break;
      case "hall":
        orderByDir = {
          Hall: {
            name: sortOrder,
          }
        };
        break;
      case "gender":
        orderByDir = {
          YoungPeople: {
            gender: sortOrder,
          }
        };
        case "classification":
        orderByDir = {
          Classification: {
            name: sortOrder,
          }
        };
        break;
    default:
      orderByDir = {
        createdAt: "asc",
      };
      break;
  }
  const where: Prisma.RegistrationWhereInput = {
    gradeLevelId:
      gradeLevel && gradeLevel !== "" && gradeLevel !== "none"
        ? gradeLevel
        : undefined,
    classificationId:
      classification && classification !== "" && classification !== "none"
        ? classification
        : undefined,
    YoungPeople: ypfirstName && ypfirstName !== "" && ypfirstName !== "none"
              ? {
                  firstName: {
                    equals: ypfirstName.toLowerCase().trim(),
                    mode: "insensitive",
                  }, 
              } 
              : gender && gender !== "" && gender !== "none"
              ? {
                gender: {
                  equals: gender === "brother" ? "Brother" : "Sister",
                }
              }
            : undefined,
   hallId:
   hall && hall !== "" && hall !== "none"
   ? hall
   : undefined,

  };
  const register = await prisma.registration.findMany({
    where,
    include: {
     YoungPeople: {
        select: {
          firstName: true,
          gender: true,
        }
      },
      Hall: {
        select: {
          name: true,
        }
      },
      GradeLevel: {
        select: {
          name: true,
        },
      },
      Classification: {
        select: {
          name: true,
        },
      },
    },
    skip: (Number(pageNumber) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: orderByDir,
  });

  const totalCount = await prisma.registration.count({
    where,
  });

  return {
    data: register.map((x) => {
      return {
        id: x.id,
        ypfirstName: x.YoungPeople.firstName,
        gender: x.YoungPeople.gender,
        gradeLevel: x.GradeLevel.name,
        classification: x.Classification.name,
        hall: x.Hall?.name,
      };
    }),
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
    }, 
  };
}

export async function register(data: RegistrationFormDTO) {
  // Check for duplicate by name + date of birth instead of ID
  const existingApplicant = await prisma.youngPeople.findFirst({
    where: {
      firstName: data.firstName.trim().toLowerCase(),
      lastName: data.lastName.trim().toLowerCase(),
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
        allergyDescription: data.basicHealthInformation.allergyDescription?.trim().toLowerCase() || null,
        allergyMedicine: data.basicHealthInformation.allergyMedicine?.trim().toLowerCase() || null,
        isHealthCondition: data.basicHealthInformation.isHealthCondition,
        healthConditionDescription:
          data.basicHealthInformation.healthConditionDescription?.trim().toLowerCase() || null,
        healthConditionMedication:
          data.basicHealthInformation.healthConditionMedicine?.trim().toLowerCase() || null,
      },
    });
    basicHealthInfoId = healthInfo.id;
  }

  // Create YoungPeople with emergency contact
  const youngpeople = await prisma.youngPeople.create({
    data: {
      lastName: data.lastName.trim().toLowerCase(),
      firstName: data.firstName.trim().toLowerCase(),
      middleName: data.middleName?.trim().toLowerCase() || null,
      suffix: data.suffix?.trim().toLowerCase() || null,
      dateOfBirth: new Date(data.dateOfBirth),
      age: parseInt(data.age, 10),
      gender: data.gender === "brother" ? "Brother" : "Sister", // Match the enum case
      image: data.image?.trim() || null,
      ContactPersonEmergency: data.contactPersonEmergency
        ? {
            create: {
              name: data.contactPersonEmergency.name?.trim().toLowerCase() || "",
              relationship:
                data.contactPersonEmergency.relationship?.trim().toLowerCase() || "",
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
      remarks: data.remarks?.trim().toLowerCase() || "",
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
