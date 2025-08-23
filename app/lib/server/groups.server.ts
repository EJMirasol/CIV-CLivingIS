
import { Prisma } from "@prisma/client";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";

export interface GroupFormData {
  name: string;
  description?: string;
  maxMembers?: number;
}

export interface GroupSearch extends pagination {
  name?: string;
  isActive?: boolean;
}

// Get all groups with pagination and filtering
export async function getGroups({
  name,
  isActive = true,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc" as "asc" | "desc",
}: GroupSearch) {
  // Check if group model is available
  if (!prisma.group) {
    throw new Error("Group model not available. Please regenerate Prisma client.");
  }
  let orderByDir: Prisma.GroupOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (sortBy) {
    case "name":
      orderByDir = { name: sortOrder };
      break;
    case "currentMembers":
      orderByDir = { currentMembers: sortOrder };
      break;
    case "maxMembers":
      orderByDir = { maxMembers: sortOrder };
      break;
    case "createdAt":
      orderByDir = { createdAt: sortOrder };
      break;
    default:
      orderByDir = { createdAt: "desc" };
      break;
  }

  const where: Prisma.GroupWhereInput = {
    isActive,
    ...(name && {
      name: {
        contains: name,
        mode: "insensitive",
      },
    }),
  };

  const groups = await prisma.group.findMany({
    where,
    include: {
      registrations: {
        include: {
          YoungPeople: {
            select: {
              firstName: true,
              lastName: true,
              gender: true,
            },
          },
        },
      },
    },
    skip: (Number(pageNumber) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: orderByDir,
  });

  const totalCount = await prisma.group.count({
    where,
  });

  return {
    data: groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      maxMembers: group.maxMembers,
      currentMembers: group.registrations.length,
      isActive: group.isActive,
      createdAt: group.createdAt,
      members: group.registrations.map((reg) => ({
        id: reg.id,
        name: `${reg.YoungPeople.firstName.toUpperCase()} ${reg.YoungPeople.lastName.toUpperCase()}`,
        gender: reg.YoungPeople.gender,
      })),
    })),
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
    },
  };
}

// Create a new group
export async function createGroup(data: GroupFormData, createdBy?: string) {
  try {
    const group = await prisma.group.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        maxMembers: data.maxMembers || null,
        createdBy: createdBy || null,
      },
    });

    return { success: true, message: "Group created successfully.", group };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A group with this name already exists.");
      }
    }
    console.error("Error creating group:", error);
    throw new Error("Failed to create group.");
  }
}

// Update a group
export async function updateGroup(groupId: string, data: GroupFormData) {
  try {
    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        maxMembers: data.maxMembers || null,
      },
    });

    return { success: true, message: "Group updated successfully.", group };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A group with this name already exists.");
      }
      if (error.code === "P2025") {
        throw new Error("Group not found.");
      }
    }
    console.error("Error updating group:", error);
    throw new Error("Failed to update group.");
  }
}

// Delete/Deactivate a group
export async function deleteGroup(groupId: string) {
  try {
    // Check if group has members
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { registrations: true },
    });

    if (!group) {
      throw new Error("Group not found.");
    }

    if (group.registrations.length > 0) {
      // If group has members, just deactivate it
      await prisma.group.update({
        where: { id: groupId },
        data: { isActive: false },
      });
      return { success: true, message: "Group deactivated successfully." };
    } else {
      // If no members, delete the group
      await prisma.group.delete({
        where: { id: groupId },
      });
      return { success: true, message: "Group deleted successfully." };
    }
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error("Failed to delete group.");
  }
}

// Get a single group by ID
export async function getGroupById(groupId: string) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        registrations: {
          include: {
            YoungPeople: {
              select: {
                firstName: true,
                lastName: true,
                gender: true,
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
        },
      },
    });

    if (!group) {
      throw new Error("Group not found.");
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      maxMembers: group.maxMembers,
      currentMembers: group.registrations.length,
      isActive: group.isActive,
      createdAt: group.createdAt,
      members: group.registrations.map((reg) => ({
        id: reg.id,
        name: `${reg.YoungPeople.firstName.toUpperCase()} ${reg.YoungPeople.lastName.toUpperCase()}`,
        gender: reg.YoungPeople.gender,
        gradeLevel: reg.GradeLevel.name,
        classification: reg.Classification.name,
      })),
    };
  } catch (error) {
    console.error("Error getting group:", error);
    throw new Error("Failed to get group.");
  }
}

// Assign registration to group
export async function assignToGroup(registrationId: string, groupId: string) {
  try {
    // Check if group exists and has capacity
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { registrations: true },
    });

    if (!group) {
      throw new Error("Group not found.");
    }

    if (!group.isActive) {
      throw new Error("Cannot assign to inactive group.");
    }

    if (group.maxMembers && group.registrations.length >= group.maxMembers) {
      throw new Error("Group has reached maximum capacity.");
    }

    // Check if registration exists and is not already in a group
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { Group: true },
    });

    if (!registration) {
      throw new Error("Registration not found.");
    }

    if (registration.Group) {
      throw new Error("Registration is already assigned to a group.");
    }

    // Assign registration to group
    await prisma.registration.update({
      where: { id: registrationId },
      data: { groupId },
    });

    return { success: true, message: "Successfully assigned to group." };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("Error assigning to group:", error);
    throw new Error("Failed to assign to group.");
  }
}

// Remove registration from group
export async function removeFromGroup(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new Error("Registration not found.");
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: { groupId: null },
    });

    return { success: true, message: "Successfully removed from group." };
  } catch (error) {
    console.error("Error removing from group:", error);
    throw new Error("Failed to remove from group.");
  }
}

// Get available registrations (not assigned to any group)
export async function getAvailableRegistrations({
  search,
  pageNumber = 1,
  pageSize = 10,
}: {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  const where: Prisma.RegistrationWhereInput = {
    groupId: null, // Only unassigned registrations
    ...(search && {
      YoungPeople: {
        OR: [
          {
            firstName: {
              contains: search.toLowerCase(),
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: search.toLowerCase(),
              mode: "insensitive",
            },
          },
        ],
      },
    }),
  };

  const registrations = await prisma.registration.findMany({
    where,
    include: {
      YoungPeople: {
        select: {
          firstName: true,
          lastName: true,
          gender: true,
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
    orderBy: {
      YoungPeople: {
        firstName: "asc",
      },
    },
  });

  const totalCount = await prisma.registration.count({
    where,
  });

  return {
    data: registrations.map((reg) => ({
      id: reg.id,
      name: `${reg.YoungPeople.firstName.toUpperCase()} ${reg.YoungPeople.lastName.toUpperCase()}`,
      gender: reg.YoungPeople.gender,
      gradeLevel: reg.GradeLevel.name,
      classification: reg.Classification.name,
    })),
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
    },
  };
}

// Get group statistics for dashboard
export async function getGroupStatistics() {
  try {
    const totalGroups = await prisma.group.count({
      where: { isActive: true },
    });

    const totalAssignedMembers = await prisma.registration.count({
      where: {
        groupId: {
          not: null,
        },
      },
    });

    const totalUnassignedMembers = await prisma.registration.count({
      where: {
        groupId: null,
      },
    });

    const groupMemberStats = await prisma.group.findMany({
      where: { isActive: true },
      select: {
        name: true,
        maxMembers: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      totalGroups,
      totalAssignedMembers,
      totalUnassignedMembers,
      groupDetails: groupMemberStats.map((group) => ({
        name: group.name,
        currentMembers: group._count.registrations,
        maxMembers: group.maxMembers,
        utilizationPercentage: group.maxMembers
          ? Math.round((group._count.registrations / group.maxMembers) * 100)
          : null,
      })),
    };
  } catch (error) {
    console.error("Error getting group statistics:", error);
    throw new Error("Failed to get group statistics.");
  }
}