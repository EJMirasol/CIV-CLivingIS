import type { Prisma } from "@prisma/client";
import type { SsotRegistrationFormDTO } from "~/types/ssot-registration.dto";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";

interface SsotRegistrationSearch extends pagination {
  name?: string;
  locality?: string;
  gender?: string;
  gradeLevel?: string;
}

export async function getSsotRegistrations({
  name,
  locality,
  gender,
  gradeLevel,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc",
}: SsotRegistrationSearch) {
  let orderByDir: Prisma.SsotRegistrationOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (sortBy) {
    case "firstName":
      orderByDir = { firstName: sortOrder };
      break;
    case "lastName":
      orderByDir = { lastName: sortOrder };
      break;
    case "locality":
      orderByDir = { locality: sortOrder };
      break;
    case "gradeLevel":
      orderByDir = { GradeLevel: { name: sortOrder } };
      break;
    case "createdAt":
      orderByDir = { createdAt: sortOrder };
      break;
    default:
      orderByDir = { createdAt: "desc" };
  }

  const where: Prisma.SsotRegistrationWhereInput = {
    ...(locality && locality !== "" && locality !== "none" && { locality: locality as any }),
    ...(gender && gender !== "" && gender !== "none" && { gender: gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() as any }),
    ...(gradeLevel && gradeLevel !== "" && gradeLevel !== "none" && { gradeLevelId: gradeLevel }),
    ...(name &&
      name !== "" &&
      name !== "none" && {
        OR: [
          { firstName: { contains: name.toLowerCase(), mode: "insensitive" } },
          { lastName: { contains: name.toLowerCase(), mode: "insensitive" } },
          { middleName: { contains: name.toLowerCase(), mode: "insensitive" } },
        ],
      }),
  };

  const registrations = await prisma.ssotRegistration.findMany({
    where,
    include: {
      GradeLevel: {
        select: { name: true },
      },
      BasicHealthInfo: true,
    },
    skip: (Number(pageNumber) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: orderByDir,
  });

  const totalCount = await prisma.ssotRegistration.count({ where });

  return {
    data: registrations.map((reg) => ({
      id: reg.id,
      firstName: reg.firstName.toUpperCase(),
      lastName: reg.lastName.toUpperCase(),
      middleName: reg.middleName?.toUpperCase() || "",
      suffix: reg.suffix?.toUpperCase() || "",
      locality: formatLocality(reg.locality),
      gender: reg.gender,
      gradeLevel: reg.GradeLevel.name,
      remarks: reg.remarks || "",
      hasAllergies: reg.BasicHealthInfo?.isAllergy || false,
      hasHealthCondition: reg.BasicHealthInfo?.isHealthCondition || false,
      isCheckedIn: reg.isCheckedIn,
      checkedInAt: reg.checkedInAt,
      createdAt: reg.createdAt,
    })),
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
    },
  };
}

function formatLocality(locality: string): string {
  const localityMap: Record<string, string> = {
    CALOOCAN_CITY: "Caloocan City",
    MALABON_CITY: "Malabon City",
    NAVOTAS_CITY: "Navotas City",
    VALENZUELA_CITY: "Valenzuela City",
  };
  return localityMap[locality] || locality;
}

 export async function registerSsot(data: SsotRegistrationFormDTO) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.ssotRegistration.findFirst({
      where: {
        firstName: data.firstName.trim().toLowerCase(),
        lastName: data.lastName.trim().toLowerCase(),
        middleName: data.middleName?.trim().toLowerCase() || null,
      },
    });

    if (existing) {
      throw new Error("Record already exists. Please check and try again.");
    }

    let basicHealthInfoId: string | undefined;
    if (
      data.basicHealthInformation &&
      (data.basicHealthInformation.isAllergies || data.basicHealthInformation.isHealthCondition)
    ) {
      const healthInfo = await tx.basicHealthInfo.create({
        data: {
          isAllergy: data.basicHealthInformation.isAllergies || false,
          allergyDescription: data.basicHealthInformation.allergyDescription?.trim() || null,
          allergyMedicine: data.basicHealthInformation.allergyMedicine?.trim() || null,
          isHealthCondition: data.basicHealthInformation.isHealthCondition || false,
          healthConditionDescription:
            data.basicHealthInformation.healthConditionDescription?.trim() || null,
          healthConditionMedication:
            data.basicHealthInformation.healthConditionMedicine?.trim() || null,
        },
      });
      basicHealthInfoId = healthInfo.id;
    }

    const registration = await tx.ssotRegistration.create({
      data: {
        lastName: data.lastName.trim().toLowerCase(),
        firstName: data.firstName.trim().toLowerCase(),
        middleName: data.middleName?.trim().toLowerCase() || null,
        suffix: data.suffix?.trim().toLowerCase() || null,
        locality: data.locality as any,
        gender: data.gender === "brother" ? "Brother" : "Sister",
        gradeLevelId: data.gradeLevel,
        remarks: data.remarks?.trim() || null,
        basicHealthInfoId,
      },
    });

    return { success: true, message: "Registration successful.", id: registration.id };
  });
}

export async function getSsotRegistrationById(id: string) {
  const registration = await prisma.ssotRegistration.findUnique({
    where: { id },
    include: {
      GradeLevel: { select: { id: true, name: true } },
      BasicHealthInfo: true,
    },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  return {
    id: registration.id,
    lastName: registration.lastName,
    firstName: registration.firstName,
    middleName: registration.middleName || "",
    suffix: registration.suffix || "",
    locality: registration.locality,
    gender: registration.gender.toLowerCase(),
    gradeLevel: registration.GradeLevel.id,
    remarks: registration.remarks || "",
    basicHealthInformation: registration.BasicHealthInfo
      ? {
          isAllergies: registration.BasicHealthInfo.isAllergy || false,
          allergyDescription: registration.BasicHealthInfo.allergyDescription || "",
          allergyMedicine: registration.BasicHealthInfo.allergyMedicine || "",
          isHealthCondition: registration.BasicHealthInfo.isHealthCondition || false,
          healthConditionDescription: registration.BasicHealthInfo.healthConditionDescription || "",
          healthConditionMedicine: registration.BasicHealthInfo.healthConditionMedication || "",
        }
      : undefined,
  };
}

export async function updateSsotRegistration(id: string, data: SsotRegistrationFormDTO) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.ssotRegistration.findUnique({
      where: { id },
      include: { BasicHealthInfo: true },
    });

    if (!existing) {
      throw new Error("Registration not found.");
    }

    const duplicate = await tx.ssotRegistration.findFirst({
      where: {
        firstName: data.firstName.trim().toLowerCase(),
        lastName: data.lastName.trim().toLowerCase(),
        middleName: data.middleName?.trim().toLowerCase() || null,
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new Error("Record already exists. Please check and try again.");
    }

    let basicHealthInfoId = existing.basicHealthInfoId;
    if (data.basicHealthInformation) {
      if (existing.BasicHealthInfo) {
        await tx.basicHealthInfo.update({
          where: { id: existing.BasicHealthInfo.id },
          data: {
            isAllergy: data.basicHealthInformation.isAllergies || false,
            allergyDescription: data.basicHealthInformation.allergyDescription?.trim() || null,
            allergyMedicine: data.basicHealthInformation.allergyMedicine?.trim() || null,
            isHealthCondition: data.basicHealthInformation.isHealthCondition || false,
            healthConditionDescription:
              data.basicHealthInformation.healthConditionDescription?.trim() || null,
            healthConditionMedication:
              data.basicHealthInformation.healthConditionMedicine?.trim() || null,
          },
        });
      } else if (
        data.basicHealthInformation.isAllergies ||
        data.basicHealthInformation.isHealthCondition
      ) {
        const healthInfo = await tx.basicHealthInfo.create({
          data: {
            isAllergy: data.basicHealthInformation.isAllergies || false,
            allergyDescription: data.basicHealthInformation.allergyDescription?.trim() || null,
            allergyMedicine: data.basicHealthInformation.allergyMedicine?.trim() || null,
            isHealthCondition: data.basicHealthInformation.isHealthCondition || false,
            healthConditionDescription:
              data.basicHealthInformation.healthConditionDescription?.trim() || null,
            healthConditionMedication:
              data.basicHealthInformation.healthConditionMedicine?.trim() || null,
          },
        });
        basicHealthInfoId = healthInfo.id;
      }
    }

    await tx.ssotRegistration.update({
      where: { id },
      data: {
        lastName: data.lastName.trim().toLowerCase(),
        firstName: data.firstName.trim().toLowerCase(),
        middleName: data.middleName?.trim().toLowerCase() || null,
        suffix: data.suffix?.trim().toLowerCase() || null,
        locality: data.locality as any,
        gender: data.gender === "brother" ? "Brother" : "Sister",
        gradeLevelId: data.gradeLevel,
        remarks: data.remarks?.trim() || null,
        basicHealthInfoId,
      },
    });

    return { success: true, message: "Successfully updated." };
  });
}

export async function deleteSsotRegistration(id: string) {
  const registration = await prisma.ssotRegistration.findUnique({
    where: { id },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  if (registration.basicHealthInfoId) {
    await prisma.basicHealthInfo.delete({
      where: { id: registration.basicHealthInfoId },
    });
  }

  await prisma.ssotRegistration.delete({
    where: { id },
  });

  return { success: true, message: "Registration deleted successfully." };
}

const SSOT_GRADE_LEVEL_ORDER = [
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
  "Serving One",
];

export async function getSsotGradeLevels() {
  const gradeLevels = await prisma.gradeLevel.findMany({
    where: {
      NOT: { name: "Graduate" },
    },
  });

  return gradeLevels
    .filter((level) => SSOT_GRADE_LEVEL_ORDER.includes(level.name))
    .sort((a, b) => SSOT_GRADE_LEVEL_ORDER.indexOf(a.name) - SSOT_GRADE_LEVEL_ORDER.indexOf(b.name))
    .map((level) => ({
      label: level.name,
      value: level.id,
    }));
}

export async function getLocalities() {
  return [
    { label: "Caloocan City", value: "CALOOCAN_CITY" },
    { label: "Malabon City", value: "MALABON_CITY" },
    { label: "Navotas City", value: "NAVOTAS_CITY" },
    { label: "Valenzuela City", value: "VALENZUELA_CITY" },
  ];
}

export async function getSsotGenders() {
  return [
    { label: "Brother", value: "brother" },
    { label: "Sister", value: "sister" },
  ];
}

export async function getSsotRegistrationsForDropdown() {
  const registrations = await prisma.ssotRegistration.findMany({
    include: { GradeLevel: { select: { name: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return registrations.map((reg) => ({
    id: reg.id,
    name: `${reg.firstName.toUpperCase()} ${reg.lastName.toUpperCase()}`,
    locality: formatLocality(reg.locality),
    gradeLevel: reg.GradeLevel.name,
    gender: reg.gender,
  }));
}

export async function exportSsotData(searchParams: { name?: string; locality?: string; gender?: string; gradeLevel?: string }) {
  const where: Prisma.SsotRegistrationWhereInput = {
    ...(searchParams.locality &&
      searchParams.locality !== "" &&
      searchParams.locality !== "none" && { locality: searchParams.locality as any }),
    ...(searchParams.gender &&
      searchParams.gender !== "" &&
      searchParams.gender !== "none" && { gender: searchParams.gender as any }),
    ...(searchParams.gradeLevel &&
      searchParams.gradeLevel !== "" &&
      searchParams.gradeLevel !== "none" && { gradeLevelId: searchParams.gradeLevel }),
    ...(searchParams.name &&
      searchParams.name !== "" &&
      searchParams.name !== "none" && {
        OR: [
          { firstName: { contains: searchParams.name.toLowerCase(), mode: "insensitive" } },
          { lastName: { contains: searchParams.name.toLowerCase(), mode: "insensitive" } },
        ],
      }),
  };

  const registrations = await prisma.ssotRegistration.findMany({
    where,
    include: {
      GradeLevel: { select: { name: true } },
      BasicHealthInfo: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return registrations.map((reg) => ({
    "First Name": reg.firstName.toUpperCase(),
    "Last Name": reg.lastName.toUpperCase(),
    "Middle Name": reg.middleName?.toUpperCase() || "",
    "Suffix": reg.suffix?.toUpperCase() || "",
    "Locality": formatLocality(reg.locality),
    "Gender": reg.gender,
    "Grade Level": reg.GradeLevel.name,
    "Has Allergies": reg.BasicHealthInfo?.isAllergy ? "Yes" : "No",
    "Allergy Description": reg.BasicHealthInfo?.allergyDescription || "",
    "Allergy Medicine": reg.BasicHealthInfo?.allergyMedicine || "",
    "Has Health Condition": reg.BasicHealthInfo?.isHealthCondition ? "Yes" : "No",
    "Health Condition Description": reg.BasicHealthInfo?.healthConditionDescription || "",
    "Health Condition Medication": reg.BasicHealthInfo?.healthConditionMedication || "",
    "Remarks": reg.remarks || "",
    "Registration Date": `${reg.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${reg.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
    "Check-In Time": reg.isCheckedIn && reg.checkedInAt
      ? `${reg.checkedInAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${reg.checkedInAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      : "-",
  }));
}

export async function getSsotStatistics() {
  const totalRegistrations = await prisma.ssotRegistration.count();

  const localityStats = await prisma.ssotRegistration.groupBy({
    by: ["locality"],
    _count: { id: true },
  });

  const genderStats = await prisma.ssotRegistration.groupBy({
    by: ["gender"],
    _count: { id: true },
  });

  const gradeLevelStats = await prisma.ssotRegistration.groupBy({
    by: ["gradeLevelId"],
    _count: { id: true },
  });

  const gradeLevelData = await Promise.all(
    gradeLevelStats.map(async (stat) => {
      const gradeLevel = await prisma.gradeLevel.findUnique({
        where: { id: stat.gradeLevelId },
        select: { name: true },
      });
      return {
        name: gradeLevel?.name || "Unknown",
        count: stat._count.id,
      };
    })
  );

  gradeLevelData.sort((a, b) => SSOT_GRADE_LEVEL_ORDER.indexOf(a.name) - SSOT_GRADE_LEVEL_ORDER.indexOf(b.name));

  return {
    totalRegistrations,
    localityDistribution: localityStats.map((stat) => ({
      locality: formatLocality(stat.locality),
      count: stat._count.id,
    })),
    genderDistribution: genderStats.map((stat) => ({
      gender: stat.gender,
      count: stat._count.id,
    })),
    gradeLevelDistribution: gradeLevelData,
  };
}

export async function getSsotDashboardStatistics() {
  const totalRegistrations = await prisma.ssotRegistration.count();
  const totalCheckedIn = await prisma.ssotRegistration.count({
    where: { isCheckedIn: true },
  });

  const genderStats = await prisma.ssotRegistration.groupBy({
    by: ["gender"],
    _count: { id: true },
  });

  const localityStats = await prisma.ssotRegistration.groupBy({
    by: ["locality"],
    _count: { id: true },
  });

  const gradeLevelStats = await prisma.ssotRegistration.groupBy({
    by: ["gradeLevelId"],
    _count: { id: true },
  });

  const gradeLevelData = await Promise.all(
    gradeLevelStats.map(async (stat) => {
      const gradeLevel = await prisma.gradeLevel.findUnique({
        where: { id: stat.gradeLevelId },
        select: { name: true },
      });
      return {
        name: gradeLevel?.name || "Unknown",
        count: stat._count.id,
      };
    })
  );

  gradeLevelData.sort((a, b) => SSOT_GRADE_LEVEL_ORDER.indexOf(a.name) - SSOT_GRADE_LEVEL_ORDER.indexOf(b.name));

  const juniorYpGrades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"];
  const seniorYpGrades = ["Grade 11", "Grade 12"];
  const servingOneGrades = ["1st Year College", "2nd Year College", "3rd Year College", "4th Year College", "Serving One"];

  const categoryCounts = gradeLevelData.reduce(
    (acc, item) => {
      if (juniorYpGrades.includes(item.name)) acc.juniorYp += item.count;
      else if (seniorYpGrades.includes(item.name)) acc.seniorYp += item.count;
      else if (servingOneGrades.includes(item.name)) acc.servingOnes += item.count;
      return acc;
    },
    { juniorYp: 0, seniorYp: 0, servingOnes: 0 }
  );

  const recentRegistrations = await prisma.ssotRegistration.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      GradeLevel: { select: { name: true } },
    },
  });

  return {
    totalRegistrations,
    totalCheckedIn,
    genderDistribution: genderStats.map((stat) => ({
      gender: stat.gender,
      count: stat._count.id,
    })),
    localityDistribution: localityStats.map((stat) => ({
      locality: formatLocality(stat.locality),
      count: stat._count.id,
    })),
    gradeLevelDistribution: gradeLevelData,
    categoryCounts,
    recentRegistrations: recentRegistrations.map((reg) => ({
      id: reg.id,
      name: `${reg.firstName.toUpperCase()} ${reg.lastName.toUpperCase()}`,
      locality: formatLocality(reg.locality),
      gender: reg.gender,
      gradeLevel: reg.GradeLevel.name,
      createdAt: reg.createdAt,
    })),
  };
}

export async function toggleSsotCheckInStatus(registrationId: string) {
  try {
    const registration = await prisma.ssotRegistration.findUnique({
      where: { id: registrationId },
      select: { isCheckedIn: true },
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    const updatedRegistration = await prisma.ssotRegistration.update({
      where: { id: registrationId },
      data: {
        isCheckedIn: !registration.isCheckedIn,
        checkedInAt: !registration.isCheckedIn ? new Date() : null,
      },
    });

    return {
      success: true,
      message: updatedRegistration.isCheckedIn ? "Checked in successfully." : "Checked out successfully.",
      isCheckedIn: updatedRegistration.isCheckedIn,
    };
  } catch (error) {
    console.error("Error toggling check-in status:", error);
    throw new Error("Failed to update check-in status");
  }
}
