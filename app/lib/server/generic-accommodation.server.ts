import { prisma } from "~/lib/prisma";

export interface GenericRoomCreateInput {
  name: string;
  description?: string;
  bedCount: number;
  maxOccupancy: number;
  eventTypeId?: string;
  createdBy?: string;
}

export interface GenericRoomUpdateInput {
  name?: string;
  description?: string;
  bedCount?: number;
  maxOccupancy?: number;
  eventTypeId?: string;
  isActive?: boolean;
}

export interface GenericRoomListArgs {
  name?: string;
  isActive?: boolean;
  eventTypeId?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getGenericRoomsList(args: GenericRoomListArgs = {}) {
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

export async function getGenericRoomById(id: string, assignmentsPage = 1, assignmentsPageSize = 10) {
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

export async function createGenericRoom(data: GenericRoomCreateInput) {
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

export async function updateGenericRoom(id: string, data: GenericRoomUpdateInput) {
  return await prisma.room.update({
    where: { id },
    data,
    include: {
      EventType: true,
    },
  });
}

export async function deleteGenericRoom(id: string) {
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

export async function getGenericAccommodationStatistics(eventTypeId?: string) {
  const whereClause = eventTypeId ? { eventTypeId } : {};
  
  const [totalRooms, activeRooms, totalAssignments] = await Promise.all([
    prisma.room.count({ where: whereClause }),
    prisma.room.findMany({
      where: { ...whereClause, isActive: true },
      select: {
        bedCount: true,
        currentOccupancy: true,
      },
    }),
    prisma.accommodationAssignment.count({
      where: eventTypeId ? {
        Room: { eventTypeId }
      } : undefined,
    }),
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

export async function getRoomsByEventType(eventTypeId: string) {
  return await prisma.room.findMany({
    where: { eventTypeId, isActive: true },
    include: {
      accommodationAssignments: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getUnassignedRegistrationsByEventType(eventTypeId?: string) {
  // For now, we'll keep this compatible with the existing Registration model
  // In the future, this could be made more generic to support different registration types
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