import { prisma } from "~/lib/prisma";

export interface EventTypeCreateInput {
  name: string;
  description?: string;
  createdBy?: string;
}

export interface EventTypeUpdateInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface EventTypeListArgs {
  name?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getEventTypesList(args: EventTypeListArgs = {}) {
  const {
    name = "",
    isActive,
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
  };

  const orderBy = {
    [sortBy]: sortOrder,
  };

  const [eventTypes, totalCount] = await Promise.all([
    prisma.eventType.findMany({
      where,
      orderBy,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    }),
    prisma.eventType.count({ where }),
  ]);

  return {
    data: eventTypes,
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getEventTypeById(id: string) {
  return await prisma.eventType.findUnique({
    where: { id },
    include: {
      rooms: {
        where: { isActive: true },
        include: {
          accommodationAssignments: true,
        },
      },
    },
  });
}

export async function createEventType(data: EventTypeCreateInput) {
  return await prisma.eventType.create({
    data,
  });
}

export async function updateEventType(id: string, data: EventTypeUpdateInput) {
  return await prisma.eventType.update({
    where: { id },
    data,
  });
}

export async function deleteEventType(id: string) {
  const eventType = await prisma.eventType.findUnique({
    where: { id },
    include: {
      rooms: true,
    },
  });

  if (!eventType) {
    throw new Error("Event type not found");
  }

  if (eventType.rooms.length > 0) {
    throw new Error("Cannot delete event type with existing rooms");
  }

  return await prisma.eventType.delete({
    where: { id },
  });
}

export async function getActiveEventTypes() {
  return await prisma.eventType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}