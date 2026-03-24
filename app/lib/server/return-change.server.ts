import type { Prisma } from "@prisma/client";
import type { ReturnChangeFormDTO } from "~/types/return-change.dto";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";

interface ReturnChangeSearch extends pagination {
  conferenceType?: string;
  name?: string;
}

export async function getReturnChanges({
  conferenceType,
  name,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc",
}: ReturnChangeSearch) {
  let orderByDir: Prisma.ReturnChangeOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (sortBy) {
    case "name":
      orderByDir = { name: sortOrder };
      break;
    case "amount":
      orderByDir = { amount: sortOrder };
      break;
    case "createdAt":
      orderByDir = { createdAt: sortOrder };
      break;
    default:
      orderByDir = { createdAt: "desc" };
  }

  const where: Prisma.ReturnChangeWhereInput = {
    isActive: true,
    ...(conferenceType &&
      conferenceType !== "" &&
      conferenceType !== "none" && { conferenceType: conferenceType as any }),
    ...(name &&
      name !== "" &&
      name !== "none" && {
        name: { contains: name.toLowerCase(), mode: "insensitive" },
      }),
  };

  const returnChanges = await prisma.returnChange.findMany({
    where,
    skip: (Number(pageNumber) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: orderByDir,
  });

  const totalCount = await prisma.returnChange.count({ where });

  return {
    data: returnChanges.map((rc) => ({
      id: rc.id,
      name: rc.name.toUpperCase(),
      amount: rc.amount,
      conferenceType: formatConferenceType(rc.conferenceType),
      createdAt: rc.createdAt,
    })),
    pagination: {
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
    },
  };
}

function formatConferenceType(type: string): string {
  const typeMap: Record<string, string> = {
    YP_CHURCH_LIVING: "YP Church Living",
    CAMANAVA_SSOT: "CAMANAVA SSOT",
  };
  return typeMap[type] || type;
}

export async function getReturnChangeById(id: string) {
  const returnChange = await prisma.returnChange.findUnique({
    where: { id },
  });

  if (!returnChange) {
    throw new Error("Return change not found.");
  }

  return {
    id: returnChange.id,
    name: returnChange.name,
    amount: returnChange.amount.toString(),
    conferenceType: returnChange.conferenceType,
  };
}

export async function createReturnChange(data: ReturnChangeFormDTO) {
  const existing = await prisma.returnChange.findFirst({
    where: {
      name: { equals: data.name.trim(), mode: "insensitive" },
      conferenceType: data.conferenceType as any,
      isActive: true,
    },
  });

  if (existing) {
    throw new Error("Record already exists. Please check and try again.");
  }

  const returnChange = await prisma.returnChange.create({
    data: {
      name: data.name.trim(),
      amount: parseFloat(data.amount),
      conferenceType: data.conferenceType as any,
    },
  });

  return { success: true, message: "Return change created successfully.", id: returnChange.id };
}

export async function updateReturnChange(id: string, data: ReturnChangeFormDTO) {
  const existing = await prisma.returnChange.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Return change not found.");
  }

  const duplicate = await prisma.returnChange.findFirst({
    where: {
      name: { equals: data.name.trim(), mode: "insensitive" },
      conferenceType: data.conferenceType as any,
      isActive: true,
      NOT: { id },
    },
  });

  if (duplicate) {
    throw new Error("Record already exists. Please check and try again.");
  }

  await prisma.returnChange.update({
    where: { id },
    data: {
      name: data.name.trim(),
      amount: parseFloat(data.amount),
      conferenceType: data.conferenceType as any,
    },
  });

  return { success: true, message: "Return change updated successfully." };
}

export async function deleteReturnChange(id: string) {
  const returnChange = await prisma.returnChange.findUnique({
    where: { id },
  });

  if (!returnChange) {
    throw new Error("Return change not found.");
  }

  await prisma.returnChange.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true, message: "Return change deleted successfully." };
}

export async function getReturnChangeStatistics(conferenceType?: string) {
  const where: Prisma.ReturnChangeWhereInput = {
    isActive: true,
    ...(conferenceType &&
      conferenceType !== "" &&
      conferenceType !== "none" && { conferenceType: conferenceType as any }),
  };

  const returnChanges = await prisma.returnChange.findMany({
    where,
    select: { amount: true },
  });

  const totalReturnChanges = returnChanges.reduce((sum, rc) => sum + rc.amount, 0);

  return { totalReturnChanges };
}
