import { prisma } from "~/lib/prisma";

export interface RoomCreateInput {
  name: string;
  description?: string;
  bedCount: number;
  maxOccupancy: number;
  eventTypeId?: string;
  createdBy?: string;
}

export interface RoomUpdateInput {
  name?: string;
  description?: string;
  bedCount?: number;
  maxOccupancy?: number;
  eventTypeId?: string;
  isActive?: boolean;
}

export interface AccommodationAssignmentInput {
  roomId: string;
  registrationId: string;
  bedNumber?: number;
  assignedBy?: string;
  notes?: string;
}

export interface RoomListArgs {
  name?: string;
  isActive?: boolean;
  eventTypeId?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getRoomsList(args: RoomListArgs = {}) {
  const {
    name = "",
    isActive,
    eventTypeId,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "name",
    sortOrder = "asc",
  } = args;

  const where = {
    ...(name && {
      name: {
        contains: name,
        mode: "insensitive" as const,
      },
    }),
    ...(isActive !== undefined && { isActive }),
    ...(eventTypeId && { eventTypeId }),
  };

  const orderBy = {
    [sortBy]: sortOrder,
  };

  const [rooms, totalCount] = await Promise.all([
    prisma.room.findMany({
      where,
      orderBy,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        EventType: true,
        accommodationAssignments: {
          include: {
            Registration: {
              include: {
                YoungPeople: true,
              },
            },
          },
        },
      },
    }),
    prisma.room.count({ where }),
  ]);

  return {
    data: rooms,
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getRoomById(id: string, assignmentsPage = 1, assignmentsPageSize = 10) {
  const [room, assignmentsCount] = await Promise.all([
    prisma.room.findUnique({
      where: { id },
      include: {
        EventType: true,
        accommodationAssignments: {
          include: {
            Registration: {
              include: {
                YoungPeople: true,
                Classification: true,
                GradeLevel: true,
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
          skip: (assignmentsPage - 1) * assignmentsPageSize,
          take: assignmentsPageSize,
        },
      },
    }),
    prisma.accommodationAssignment.count({
      where: { roomId: id },
    }),
  ]);

  if (!room) return null;

  return {
    ...room,
    assignmentsPagination: {
      pageNumber: assignmentsPage,
      pageSize: assignmentsPageSize,
      totalCount: assignmentsCount,
      totalPages: Math.ceil(assignmentsCount / assignmentsPageSize),
    },
  };
}

export async function createRoom(data: RoomCreateInput) {
  return await prisma.room.create({
    data: {
      ...data,
      currentOccupancy: 0,
    },
    include: {
      EventType: true,
    },
  });
}

export async function updateRoom(id: string, data: RoomUpdateInput) {
  return await prisma.room.update({
    where: { id },
    data,
    include: {
      EventType: true,
    },
  });
}

export async function deleteRoom(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      accommodationAssignments: true,
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.accommodationAssignments.length > 0) {
    throw new Error("Cannot delete room with existing assignments");
  }

  return await prisma.room.delete({
    where: { id },
  });
}

export async function assignAccommodation(data: AccommodationAssignmentInput) {
  const existingAssignment = await prisma.accommodationAssignment.findUnique({
    where: { registrationId: data.registrationId },
  });

  if (existingAssignment) {
    throw new Error("Registration already has an accommodation assignment");
  }

  const room = await prisma.room.findUnique({
    where: { id: data.roomId },
    include: {
      accommodationAssignments: true,
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.accommodationAssignments.length >= room.maxOccupancy) {
    throw new Error("Room is at maximum capacity");
  }

  // Check for duplicate bed number in the same room
  if (data.bedNumber) {
    const existingBedAssignment = await prisma.accommodationAssignment.findFirst({
      where: {
        roomId: data.roomId,
        bedNumber: data.bedNumber,
      },
    });

    if (existingBedAssignment) {
      throw new Error(`Bed #${data.bedNumber} is already assigned in this room`);
    }
  }

  const assignment = await prisma.accommodationAssignment.create({
    data,
  });

  await prisma.room.update({
    where: { id: data.roomId },
    data: {
      currentOccupancy: {
        increment: 1,
      },
    },
  });

  return assignment;
}

export async function removeAccommodationAssignment(assignmentId: string) {
  const assignment = await prisma.accommodationAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  await prisma.accommodationAssignment.delete({
    where: { id: assignmentId },
  });

  await prisma.room.update({
    where: { id: assignment.roomId },
    data: {
      currentOccupancy: {
        decrement: 1,
      },
    },
  });

  return assignment;
}

export async function getUnassignedRegistrations() {
  return await prisma.registration.findMany({
    where: {
      accommodationAssignment: null,
    },
    include: {
      YoungPeople: true,
      Classification: true,
      GradeLevel: true,
      Hall: true,
    },
    orderBy: {
      YoungPeople: {
        firstName: "asc",
      },
    },
  });
}

export async function getAccommodationAssignments(options: {
  roomId?: string;
  pageNumber?: number;
  pageSize?: number;
} = {}) {
  const { roomId, pageNumber = 1, pageSize = 10 } = options;

  const where = roomId ? { roomId } : undefined;

  const [assignments, totalCount] = await Promise.all([
    prisma.accommodationAssignment.findMany({
      where,
      include: {
        Room: true,
        Registration: {
          include: {
            YoungPeople: true,
            Classification: true,
            GradeLevel: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    }),
    prisma.accommodationAssignment.count({ where }),
  ]);

  return {
    data: assignments,
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getAccommodationStatistics() {
  const [totalRooms, activeRooms, totalAssignments] = await Promise.all([
    prisma.room.count(),
    prisma.room.findMany({
      where: { isActive: true },
      select: {
        bedCount: true,
        currentOccupancy: true,
      },
    }),
    prisma.accommodationAssignment.count(),
  ]);

  const totalBeds = activeRooms.reduce((sum, room) => sum + room.bedCount, 0);
  const occupiedBeds = activeRooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
  const availableBeds = totalBeds - occupiedBeds;

  return {
    totalRooms,
    totalBeds,
    occupiedBeds,
    availableBeds,
    totalAssignments,
  };
}