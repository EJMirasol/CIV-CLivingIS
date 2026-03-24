import type { Prisma } from "@prisma/client";
import type { ExpenseFormDTO } from "~/types/expense.dto";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";

interface ExpenseSearch extends pagination {
  conferenceType?: string;
  name?: string;
}

export async function getExpenses({
  conferenceType,
  name,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc",
}: ExpenseSearch) {
  let orderByDir: Prisma.ExpenseOrderByWithRelationInput = {
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

  const where: Prisma.ExpenseWhereInput = {
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

  const expenses = await prisma.expense.findMany({
    where,
    skip: (Number(pageNumber) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: orderByDir,
  });

  const totalCount = await prisma.expense.count({ where });

  return {
    data: expenses.map((expense) => ({
      id: expense.id,
      name: expense.name.toUpperCase(),
      amount: expense.amount,
      conferenceType: formatConferenceType(expense.conferenceType),
      createdAt: expense.createdAt,
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

export async function getExpenseById(id: string) {
  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  return {
    id: expense.id,
    name: expense.name,
    amount: expense.amount.toString(),
    conferenceType: expense.conferenceType,
  };
}

export async function createExpense(data: ExpenseFormDTO) {
  const existing = await prisma.expense.findFirst({
    where: {
      name: { equals: data.name.trim(), mode: "insensitive" },
      conferenceType: data.conferenceType as any,
      isActive: true,
    },
  });

  if (existing) {
    throw new Error("Record already exists. Please check and try again.");
  }

  const expense = await prisma.expense.create({
    data: {
      name: data.name.trim(),
      amount: parseFloat(data.amount),
      conferenceType: data.conferenceType as any,
    },
  });

  return { success: true, message: "Expense created successfully.", id: expense.id };
}

export async function updateExpense(id: string, data: ExpenseFormDTO) {
  const existing = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Expense not found.");
  }

  const duplicate = await prisma.expense.findFirst({
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

  await prisma.expense.update({
    where: { id },
    data: {
      name: data.name.trim(),
      amount: parseFloat(data.amount),
      conferenceType: data.conferenceType as any,
    },
  });

  return { success: true, message: "Expense updated successfully." };
}

export async function deleteExpense(id: string) {
  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  await prisma.expense.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true, message: "Expense deleted successfully." };
}

export async function getExpenseStatistics(conferenceType?: string) {
  const where: Prisma.ExpenseWhereInput = {
    isActive: true,
    ...(conferenceType &&
      conferenceType !== "" &&
      conferenceType !== "none" && { conferenceType: conferenceType as any }),
  };

  const expenses = await prisma.expense.findMany({
    where,
    select: { amount: true },
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { totalExpenses };
}
