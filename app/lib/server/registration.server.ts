import type { Prisma } from "@prisma/client";
import type { RegistrationFormDTO } from "~/types/registration.dto";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";

interface ChurchLivingSearch extends pagination {
  hall: string;
  ypfirstName: string;
  gender: string;
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
        },
      };
      break;
    case "gender":
      orderByDir = {
        YoungPeople: {
          gender: sortOrder,
        },
      };
      break;
    case "classification":
      orderByDir = {
        Classification: {
          name: sortOrder,
        },
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
    YoungPeople:
      ypfirstName && ypfirstName !== "" && ypfirstName !== "none"
        ? {
            firstName: {
              contains: ypfirstName.toLowerCase().trim(),
              mode: "insensitive",
            },
          }
        : gender && gender !== "" && gender !== "none"
        ? {
            gender: {
              equals: gender === "brother" ? "Brother" : "Sister",
            },
          }
        : undefined,
    hallId: hall && hall !== "" && hall !== "none" ? hall : undefined,
  };
  const register = await prisma.registration.findMany({
    where,
    include: {
      YoungPeople: {
        select: {
          firstName: true,
          gender: true,
        },
      },
      Hall: {
        select: {
          name: true,
        },
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
        ypfirstName: x.YoungPeople.firstName.toUpperCase(),
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
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
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
        allergyDescription:
          data.basicHealthInformation.allergyDescription
            ?.trim()
            .toLowerCase() || null,
        allergyMedicine:
          data.basicHealthInformation.allergyMedicine?.trim().toLowerCase() ||
          null,
        isHealthCondition: data.basicHealthInformation.isHealthCondition,
        healthConditionDescription:
          data.basicHealthInformation.healthConditionDescription
            ?.trim()
            .toLowerCase() || null,
        healthConditionMedication:
          data.basicHealthInformation.healthConditionMedicine
            ?.trim()
            .toLowerCase() || null,
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
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      age: data.age ? parseInt(data.age, 10) : null,
      gender: data.gender === "brother" ? "Brother" : "Sister", // Match the enum case
      image: data.image?.trim() || null,
      ContactPersonEmergency: data.contactPersonEmergency
        ? {
            create: {
              name:
                data.contactPersonEmergency.name?.trim().toLowerCase() || "",
              relationship:
                data.contactPersonEmergency.relationship
                  ?.trim()
                  .toLowerCase() || "",
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
    orderBy: { name: "asc" },
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

export async function exportYPCLData(searchParams: {
  hall?: string;
  ypfirstName?: string;
  gender?: string;
  classification?: string;
  gradeLevel?: string;
}) {
  console.log("🔍 exportYPCLData called with params:", searchParams);
  
  const where: Prisma.RegistrationWhereInput = {};

  // Only add filters if they have actual values
  if (searchParams.gradeLevel && searchParams.gradeLevel !== "" && searchParams.gradeLevel !== "none") {
    where.gradeLevelId = searchParams.gradeLevel;
  }

  if (searchParams.classification && searchParams.classification !== "" && searchParams.classification !== "none") {
    where.classificationId = searchParams.classification;
  }

  if (searchParams.hall && searchParams.hall !== "" && searchParams.hall !== "none") {
    where.hallId = searchParams.hall;
  }

  // Handle YoungPeople filters
  if (searchParams.ypfirstName && searchParams.ypfirstName !== "" && searchParams.ypfirstName !== "none") {
    where.YoungPeople = {
      firstName: {
        contains: searchParams.ypfirstName.toLowerCase().trim(),
        mode: "insensitive",
      },
    };
  } else if (searchParams.gender && searchParams.gender !== "" && searchParams.gender !== "none") {
    where.YoungPeople = {
      gender: {
        equals: searchParams.gender === "brother" ? "Brother" : "Sister",
      },
    };
  }

  console.log("🔎 Built where clause:", JSON.stringify(where, null, 2));
  
  try {
    const registrations = await prisma.registration.findMany({
      where,
      include: {
        YoungPeople: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            suffix: true,
            dateOfBirth: true,
            age: true,
            gender: true,
            ContactPersonEmergency: {
              select: {
                name: true,
                relationship: true,
                contactNumber: true,
              },
            },
          },
        },
        Hall: {
          select: {
            name: true,
          },
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
        BasicHealthInfo: {
          select: {
            isAllergy: true,
            allergyDescription: true,
            allergyMedicine: true,
            isHealthCondition: true,
            healthConditionDescription: true,
            healthConditionMedication: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    
    console.log("✅ Database query successful, found", registrations.length, "registrations");

    const mappedData = registrations.map((registration) => ({
      "First Name": registration.YoungPeople.firstName.toUpperCase(),
      "Last Name": registration.YoungPeople.lastName.toUpperCase(),
      "Middle Name": registration.YoungPeople.middleName?.toUpperCase() || "",
      "Suffix": registration.YoungPeople.suffix?.toUpperCase() || "",
      "Date of Birth": registration.YoungPeople.dateOfBirth?.toLocaleDateString() || "",
      "Age": registration.YoungPeople.age,
      "Gender": registration.YoungPeople.gender,
      "Grade Level": registration.GradeLevel.name,
      "Classification": registration.Classification.name,
      "Hall": registration.Hall?.name || "",
      "Emergency Contact Name": registration.YoungPeople.ContactPersonEmergency?.name || "",
      "Emergency Contact Relationship": registration.YoungPeople.ContactPersonEmergency?.relationship || "",
      "Emergency Contact Number": registration.YoungPeople.ContactPersonEmergency?.contactNumber || "",
      "Has Allergies": registration.BasicHealthInfo?.isAllergy ? "Yes" : "No",
      "Allergy Description": registration.BasicHealthInfo?.allergyDescription || "",
      "Allergy Medicine": registration.BasicHealthInfo?.allergyMedicine || "",
      "Has Health Condition": registration.BasicHealthInfo?.isHealthCondition ? "Yes" : "No",
      "Health Condition Description": registration.BasicHealthInfo?.healthConditionDescription || "",
      "Health Condition Medication": registration.BasicHealthInfo?.healthConditionMedication || "",
      "Registration Date": registration.dateRegistered.toLocaleDateString(),
      "Remarks": registration.remarks || "",
    }));

    console.log("✅ Data mapping completed, returning", mappedData.length, "records");
    return mappedData;

  } catch (error) {
    console.error("❌ Database error in exportYPCLData:", error);
    throw error;
  }
}

export async function getDashboardStatistics() {
  try {
    const totalRegistrations = await prisma.registration.count();
    const totalCheckedIn = await prisma.registration.count({
      where: { isCheckedIn: true }
    });

    const genderStats = await prisma.registration.groupBy({
      by: ['youngPeopleId'],
      _count: {
        id: true
      }
    });

    const actualGenderStats = await prisma.youngPeople.groupBy({
      by: ['gender'],
      _count: {
        gender: true
      }
    });

    const gradeLevelStats = await prisma.registration.groupBy({
      by: ['gradeLevelId'],
      _count: {
        id: true
      }
    });

    const gradeLevelData = await Promise.all(
      gradeLevelStats.map(async (stat) => {
        const gradeLevel = await prisma.gradeLevel.findUnique({
          where: { id: stat.gradeLevelId },
          select: { name: true }
        });
        return {
          name: gradeLevel?.name || 'Unknown',
          count: stat._count.id
        };
      })
    );

    const classificationStats = await prisma.registration.groupBy({
      by: ['classificationId'],
      _count: {
        id: true
      }
    });

    const classificationData = await Promise.all(
      classificationStats.map(async (stat) => {
        const classification = await prisma.classification.findUnique({
          where: { id: stat.classificationId },
          select: { name: true }
        });
        return {
          name: classification?.name || 'Unknown',
          count: stat._count.id
        };
      })
    );

    const hallStats = await prisma.registration.groupBy({
      by: ['hallId'],
      _count: {
        id: true
      },
      where: {
        hallId: {
          not: null
        }
      }
    });

    const hallData = await Promise.all(
      hallStats.map(async (stat) => {
        const hall = await prisma.hall.findUnique({
          where: { id: stat.hallId! },
          select: { name: true }
        });
        return {
          name: hall?.name || 'Unknown',
          count: stat._count.id
        };
      })
    );

    const healthStats = await prisma.basicHealthInfo.aggregate({
      _count: {
        isAllergy: true,
        isHealthCondition: true
      },
      where: {
        OR: [
          { isAllergy: true },
          { isHealthCondition: true }
        ]
      }
    });

    const allergiesCount = await prisma.basicHealthInfo.count({
      where: { isAllergy: true }
    });

    const healthConditionsCount = await prisma.basicHealthInfo.count({
      where: { isHealthCondition: true }
    });

    const recentRegistrations = await prisma.registration.findMany({
      take: 5,
      orderBy: {
        dateRegistered: 'desc'
      },
      include: {
        YoungPeople: {
          select: {
            firstName: true,
            lastName: true,
            gender: true
          }
        },
        Classification: {
          select: {
            name: true
          }
        }
      }
    });

    // Group statistics - wrap in try-catch to handle cases where group table doesn't exist yet
    let groupInfo;
    try {
      const totalGroups = await prisma.group.count({
        where: { isActive: true }
      });

      const totalAssignedMembers = await prisma.registration.count({
        where: {
          groupId: {
            not: null
          }
        }
      });

      const totalUnassignedMembers = await prisma.registration.count({
        where: {
          groupId: null
        }
      });

      const topGroups = await prisma.group.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          maxMembers: true,
          _count: {
            select: {
              registrations: true
            }
          }
        },
        orderBy: {
          registrations: {
            _count: 'desc'
          }
        },
        take: 5
      });

      groupInfo = {
        totalGroups,
        totalAssignedMembers,
        totalUnassignedMembers,
        assignmentPercentage: totalRegistrations > 0 
          ? Math.round((totalAssignedMembers / totalRegistrations) * 100) 
          : 0,
        topGroups: topGroups.map(group => ({
          id: group.id,
          name: group.name,
          currentMembers: group._count.registrations,
          maxMembers: group.maxMembers,
          utilizationPercentage: group.maxMembers 
            ? Math.round((group._count.registrations / group.maxMembers) * 100)
            : null
        }))
      };
    } catch (error) {
      console.log("Group statistics not available:", error);
      // Fallback group info if group table doesn't exist or has issues
      groupInfo = {
        totalGroups: 0,
        totalAssignedMembers: 0,
        totalUnassignedMembers: totalRegistrations,
        assignmentPercentage: 0,
        topGroups: []
      };
    }

    return {
      totalRegistrations,
      totalCheckedIn,
      genderDistribution: actualGenderStats.map(stat => ({
        gender: stat.gender,
        count: stat._count.gender
      })),
      gradeLevelDistribution: gradeLevelData,
      classificationDistribution: classificationData,
      hallDistribution: hallData,
      healthInfo: {
        allergies: allergiesCount,
        healthConditions: healthConditionsCount
      },
      groupInfo,
      recentRegistrations: recentRegistrations.map(reg => ({
        id: reg.id,
        name: `${reg.YoungPeople.firstName.toUpperCase()} ${reg.YoungPeople.lastName.toUpperCase()}`,
        gender: reg.YoungPeople.gender,
        classification: reg.Classification.name,
        dateRegistered: reg.dateRegistered
      }))
    };
  } catch (error) {
    console.error("Error getting dashboard statistics:", error);
    throw new Error("Failed to get dashboard statistics");
  }
}

export async function getRegistrationById(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        YoungPeople: {
          include: {
            ContactPersonEmergency: true,
          },
        },
        Hall: {
          select: {
            id: true,
            name: true,
          },
        },
        GradeLevel: {
          select: {
            id: true,
            name: true,
          },
        },
        Classification: {
          select: {
            id: true,
            name: true,
          },
        },
        BasicHealthInfo: true,
      },
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    return {
      id: registration.id,
      lastName: registration.YoungPeople.lastName,
      firstName: registration.YoungPeople.firstName,
      middleName: registration.YoungPeople.middleName || "",
      suffix: registration.YoungPeople.suffix || "",
      gender: registration.YoungPeople.gender.toLowerCase(),
      dateOfBirth: registration.YoungPeople?.dateOfBirth ? registration.YoungPeople.dateOfBirth.toISOString().split('T')[0] : "",
      age: registration.YoungPeople?.age?.toString() || null,
      image: registration.YoungPeople.image || "",
      hall: registration.Hall?.id || "",
      classification: registration.Classification.id,
      gradeLevel: registration.GradeLevel.id,
      remarks: registration.remarks || "",
      basicHealthInformation: registration.BasicHealthInfo ? {
        isAllergies: registration.BasicHealthInfo.isAllergy || false,
        allergyDescription: registration.BasicHealthInfo.allergyDescription || "",
        allergyMedicine: registration.BasicHealthInfo.allergyMedicine || "",
        isHealthCondition: registration.BasicHealthInfo.isHealthCondition || false,
        healthConditionDescription: registration.BasicHealthInfo.healthConditionDescription || "",
        healthConditionMedicine: registration.BasicHealthInfo.healthConditionMedication || "",
      } : undefined,
      contactPersonEmergency: registration.YoungPeople.ContactPersonEmergency ? {
        name: registration.YoungPeople.ContactPersonEmergency.name || "",
        relationship: registration.YoungPeople.ContactPersonEmergency.relationship || "",
        contactNumber: registration.YoungPeople.ContactPersonEmergency.contactNumber || "",
      } : undefined,
    };
  } catch (error) {
    console.error("Error getting registration:", error);
    throw new Error("Failed to get registration");
  }
}

export async function updateRegistration(registrationId: string, data: RegistrationFormDTO) {
  try {
    // Get the existing registration
    const existingRegistration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        YoungPeople: {
          include: {
            ContactPersonEmergency: true,
          },
        },
        BasicHealthInfo: true,
      },
    });

    if (!existingRegistration) {
      throw new Error("Registration not found");
    }

    // Check for duplicate by name + date of birth (excluding current record)
    const duplicateCheck = await prisma.youngPeople.findFirst({
      where: {
        firstName: data.firstName.trim().toLowerCase(),
        lastName: data.lastName.trim().toLowerCase(),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        NOT: {
          id: existingRegistration.youngPeopleId,
        },
      },
    });

    if (duplicateCheck) {
      throw new Error("Duplicate");
    }

    // Update or create BasicHealthInfo if provided
    let basicHealthInfoId = existingRegistration.basicHealthInfoId;
    if (data.basicHealthInformation) {
      if (basicHealthInfoId) {
        await prisma.basicHealthInfo.update({
          where: { id: basicHealthInfoId },
          data: {
            isAllergy: data.basicHealthInformation.isAllergies,
            allergyDescription: data.basicHealthInformation.allergyDescription?.trim().toLowerCase() || null,
            allergyMedicine: data.basicHealthInformation.allergyMedicine?.trim().toLowerCase() || null,
            isHealthCondition: data.basicHealthInformation.isHealthCondition,
            healthConditionDescription: data.basicHealthInformation.healthConditionDescription?.trim().toLowerCase() || null,
            healthConditionMedication: data.basicHealthInformation.healthConditionMedicine?.trim().toLowerCase() || null,
          },
        });
      } else {
        const healthInfo = await prisma.basicHealthInfo.create({
          data: {
            isAllergy: data.basicHealthInformation.isAllergies,
            allergyDescription: data.basicHealthInformation.allergyDescription?.trim().toLowerCase() || null,
            allergyMedicine: data.basicHealthInformation.allergyMedicine?.trim().toLowerCase() || null,
            isHealthCondition: data.basicHealthInformation.isHealthCondition,
            healthConditionDescription: data.basicHealthInformation.healthConditionDescription?.trim().toLowerCase() || null,
            healthConditionMedication: data.basicHealthInformation.healthConditionMedicine?.trim().toLowerCase() || null,
          },
        });
        basicHealthInfoId = healthInfo.id;
      }
    }

    // Update or create ContactPersonEmergency
    if (data.contactPersonEmergency) {
      if (existingRegistration.YoungPeople.ContactPersonEmergency) {
        await prisma.contactPersonEmergency.update({
          where: { id: existingRegistration.YoungPeople.ContactPersonEmergency.id },
          data: {
            name: data.contactPersonEmergency.name?.trim().toLowerCase() || "",
            relationship: data.contactPersonEmergency.relationship?.trim().toLowerCase() || "",
            contactNumber: data.contactPersonEmergency.contactNumber?.trim() || "",
          },
        });
      } else {
        await prisma.contactPersonEmergency.create({
          data: {
            name: data.contactPersonEmergency.name?.trim().toLowerCase() || "",
            relationship: data.contactPersonEmergency.relationship?.trim().toLowerCase() || "",
            contactNumber: data.contactPersonEmergency.contactNumber?.trim() || "",
            youngPersonId: existingRegistration.youngPeopleId,
          },
        });
      }
    }

    // Update YoungPeople
    await prisma.youngPeople.update({
      where: { id: existingRegistration.youngPeopleId },
      data: {
        lastName: data.lastName.trim().toLowerCase(),
        firstName: data.firstName.trim().toLowerCase(),
        middleName: data.middleName?.trim().toLowerCase() || null,
        suffix: data.suffix?.trim().toLowerCase() || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        age: data.age ? parseInt(data.age, 10) : null,
        gender: data.gender === "brother" ? "Brother" : "Sister",
        image: data.image?.trim() || null,
      },
    });

    // Update Registration
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        gradeLevelId: data.gradeLevel,
        hallId: data.hall,
        classificationId: data.classification,
        remarks: data.remarks?.trim().toLowerCase() || "",
        basicHealthInfoId: basicHealthInfoId,
      },
    });

    return { success: true, message: "Registration updated successfully." };
  } catch (error) {
    console.error("Error updating registration:", error);
    if (error instanceof Error && error.message === "Duplicate") {
      throw error;
    }
    throw new Error("Failed to update registration");
  }
}

export async function deleteRegistration(registrationId: string) {
  try {
    // Get the registration to find the young person and health info
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        YoungPeople: {
          include: {
            ContactPersonEmergency: true,
          },
        },
      },
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    // Delete in correct order due to foreign key constraints
    // 1. Delete emergency contact if exists
    if (registration.YoungPeople.ContactPersonEmergency) {
      await prisma.contactPersonEmergency.delete({
        where: { id: registration.YoungPeople.ContactPersonEmergency.id },
      });
    }

    // 2. Delete basic health info if exists
    if (registration.basicHealthInfoId) {
      await prisma.basicHealthInfo.delete({
        where: { id: registration.basicHealthInfoId },
      });
    }

    // 3. Delete registration
    await prisma.registration.delete({
      where: { id: registrationId },
    });

    // 4. Delete young person
    await prisma.youngPeople.delete({
      where: { id: registration.youngPeopleId },
    });

    return { success: true, message: "Registration deleted successfully." };
  } catch (error) {
    console.error("Error deleting registration:", error);
    throw new Error("Failed to delete registration");
  }
}

export async function toggleCheckInStatus(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { isCheckedIn: true }
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        isCheckedIn: !registration.isCheckedIn,
        checkedInAt: !registration.isCheckedIn ? new Date() : null,
      },
    });

    return { 
      success: true, 
      message: updatedRegistration.isCheckedIn ? "Checked in successfully." : "Checked out successfully.",
      isCheckedIn: updatedRegistration.isCheckedIn
    };
  } catch (error) {
    console.error("Error toggling check-in status:", error);
    throw new Error("Failed to update check-in status");
  }
}

export async function getRegistrationList({
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
        },
      };
      break;
    case "gender":
      orderByDir = {
        YoungPeople: {
          gender: sortOrder,
        },
      };
      break;
    case "classification":
      orderByDir = {
        Classification: {
          name: sortOrder,
        },
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
    YoungPeople:
      ypfirstName && ypfirstName !== "" && ypfirstName !== "none"
        ? {
            firstName: {
              contains: ypfirstName.toLowerCase().trim(),
              mode: "insensitive",
            },
          }
        : gender && gender !== "" && gender !== "none"
        ? {
            gender: {
              equals: gender === "brother" ? "Brother" : "Sister",
            },
          }
        : undefined,
    hallId: hall && hall !== "" && hall !== "none" ? hall : undefined,
  };
  const register = await prisma.registration.findMany({
    where,
    include: {
      YoungPeople: {
        select: {
          firstName: true,
          lastName: true,
          gender: true,
        },
      },
      Hall: {
        select: {
          name: true,
        },
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
        ypfirstName: x.YoungPeople.firstName.toUpperCase(),
        yplastName: x.YoungPeople.lastName.toUpperCase(),
        gender: x.YoungPeople.gender,
        gradeLevel: x.GradeLevel.name,
        classification: x.Classification.name,
        hall: x.Hall?.name,
        isCheckedIn: x.isCheckedIn,
        checkedInAt: x.checkedInAt,
      };
    }),
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
    },
  };
}
