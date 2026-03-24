import type { Prisma } from "@prisma/client";
import type { BillingSettingFormDTO } from "~/types/billing-setting.dto";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";

interface BillingSettingSearch extends pagination {
  conferenceType?: string;
  feeType?: string;
}

export async function getBillingSettings({
  conferenceType,
  feeType,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc",
}: BillingSettingSearch) {
  let orderByDir: Prisma.BillingSettingOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (sortBy) {
    case "feeType":
      orderByDir = { feeType: sortOrder };
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

  const where: Prisma.BillingSettingWhereInput = {
    isActive: true,
    ...(conferenceType &&
      conferenceType !== "" &&
      conferenceType !== "none" && { conferenceType: conferenceType as any }),
    ...(feeType &&
      feeType !== "" &&
      feeType !== "none" && {
        feeType: { contains: feeType.toLowerCase(), mode: "insensitive" },
      }),
  };

  const settings = await prisma.billingSetting.findMany({
    where,
    skip: (Number(pageNumber) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: orderByDir,
  });

  const totalCount = await prisma.billingSetting.count({ where });

  return {
    data: settings.map((setting) => ({
      id: setting.id,
      feeType: setting.feeType,
      conferenceType: formatConferenceType(setting.conferenceType),
      amount: setting.amount,
      remarks: setting.remarks || "",
      isActive: setting.isActive,
      createdAt: setting.createdAt,
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

export async function createBillingSetting(data: BillingSettingFormDTO) {
  const normalizedFeeType = data.feeType.trim();

  const existing = await prisma.billingSetting.findFirst({
    where: {
      feeType: { equals: normalizedFeeType, mode: "insensitive" }
    },
  });

  if (existing) {
    throw new Error("A billing setting with this fee type already exists.");
  }

  const setting = await prisma.billingSetting.create({
    data: {
      feeType: normalizedFeeType,
      conferenceType: data.conferenceType as any,
      amount: parseFloat(data.amount),
      remarks: data.remarks?.trim() || null,
    },
  });

  return { success: true, message: "Billing setting created successfully.", id: setting.id };
}

export async function getBillingSettingById(id: string) {
  const setting = await prisma.billingSetting.findUnique({
    where: { id },
  });

  if (!setting) {
    throw new Error("Billing setting not found.");
  }

  return {
    id: setting.id,
    feeType: setting.feeType,
    conferenceType: setting.conferenceType,
    amount: setting.amount.toString(),
    remarks: setting.remarks || "",
    isActive: setting.isActive,
  };
}

export async function updateBillingSetting(id: string, data: BillingSettingFormDTO) {
  const existing = await prisma.billingSetting.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Billing setting not found.");
  }

  const normalizedFeeType = data.feeType.trim();

  const duplicate = await prisma.billingSetting.findFirst({
    where: {
      feeType: { equals: normalizedFeeType, mode: "insensitive" },
      NOT: { id },
    },
  });

  if (duplicate) {
    throw new Error("A billing setting with this fee type already exists.");
  }

  await prisma.billingSetting.update({
    where: { id },
    data: {
      feeType: normalizedFeeType,
      conferenceType: data.conferenceType as any,
      amount: parseFloat(data.amount),
      remarks: data.remarks?.trim() || null,
    },
  });

  return { success: true, message: "Successfully updated." };
}

export async function deleteBillingSetting(id: string) {
  const setting = await prisma.billingSetting.findUnique({
    where: { id },
  });

  if (!setting) {
    throw new Error("Billing setting not found.");
  }

  await prisma.billingSetting.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true, message: "Billing setting deleted successfully." };
}

export async function getBillingSettingsByConferenceType(conferenceType: string) {
  const settings = await prisma.billingSetting.findMany({
    where: {
      isActive: true,
      conferenceType: conferenceType as any,
    },
    orderBy: { feeType: "asc" },
  });

  return settings.map((setting) => ({
    id: setting.id,
    feeType: setting.feeType,
    amount: setting.amount,
    conferenceType: setting.conferenceType,
  }));
}

export async function getBillingSettingsForDropdown(conferenceType?: string) {
  const where: Prisma.BillingSettingWhereInput = {
    isActive: true,
    ...(conferenceType && conferenceType !== "" && { conferenceType: conferenceType as any }),
  };

  const settings = await prisma.billingSetting.findMany({
    where,
    orderBy: { feeType: "asc" },
  });

  return settings.map((setting) => ({
    label: `${setting.feeType} - ₱${setting.amount.toLocaleString()}`,
    value: setting.id,
    feeType: setting.feeType,
    amount: setting.amount,
  }));
}

export async function getAllBillingSettings() {
  const settings = await prisma.billingSetting.findMany({
    where: { isActive: true },
    orderBy: { feeType: "asc" },
  });

  return settings.map((setting) => ({
    id: setting.id,
    feeType: setting.feeType,
    conferenceType: setting.conferenceType,
    amount: setting.amount,
  }));
}
