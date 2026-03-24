import type { Prisma } from "@prisma/client";
import type { pagination } from "~/lib/pagination";
import { prisma } from "~/lib/prisma";

interface FinanceRecordSearch extends pagination {
  conferenceType?: string;
  name?: string;
  isPaid?: string;
}

export async function getFinanceRecords({
  conferenceType,
  name,
  isPaid,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc",
}: FinanceRecordSearch) {
  let orderByDir: Prisma.FinanceRecordOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (sortBy) {
    case "createdAt":
      orderByDir = { createdAt: sortOrder };
      break;
    case "isPaid":
      orderByDir = { isPaid: sortOrder };
      break;
    default:
      orderByDir = { createdAt: "desc" };
  }

  const where: Prisma.FinanceRecordWhereInput = {
    ...(conferenceType &&
      conferenceType !== "" &&
      conferenceType !== "none" && { conferenceType: conferenceType as any }),
    ...(isPaid && isPaid !== "" && isPaid !== "none" && { isPaid: isPaid === "true" }),
    ...(name &&
      name !== "" &&
      name !== "none" && {
        OR: [
          {
            Registration: {
              YoungPeople: {
                OR: [
                  { firstName: { contains: name.toLowerCase(), mode: "insensitive" } },
                  { lastName: { contains: name.toLowerCase(), mode: "insensitive" } },
                ],
              },
            },
          },
          {
            SsotRegistration: {
              OR: [
                { firstName: { contains: name.toLowerCase(), mode: "insensitive" } },
                { lastName: { contains: name.toLowerCase(), mode: "insensitive" } },
              ],
            },
          },
        ],
      }),
  };

  const records = await prisma.financeRecord.findMany({
    where,
    include: {
      BillingSetting: true,
      Registration: {
        include: {
          YoungPeople: { select: { firstName: true, lastName: true } },
        },
      },
      SsotRegistration: {
        include: { GradeLevel: { select: { name: true } } },
      },
    },
    skip: (Number(pageNumber) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: orderByDir,
  });

  const totalCount = await prisma.financeRecord.count({ where });

  return {
    data: records.map((record) => {
      const isSsot = record.conferenceType === "CAMANAVA_SSOT";
      const name = isSsot
        ? `${record.SsotRegistration?.firstName?.toUpperCase() || ""} ${record.SsotRegistration?.lastName?.toUpperCase() || ""}`
        : `${record.Registration?.YoungPeople?.firstName?.toUpperCase() || ""} ${record.Registration?.YoungPeople?.lastName?.toUpperCase() || ""}`;
      const locality = isSsot
        ? formatLocality(record.SsotRegistration?.locality || "")
        : null;

      return {
        id: record.id,
        name,
        locality,
        conferenceType: formatConferenceType(record.conferenceType),
        feeType: record.BillingSetting.feeType,
        amount: record.BillingSetting.amount,
        isPaid: record.isPaid,
        paidAt: record.paidAt,
        createdAt: record.createdAt,
        registrationId: record.registrationId,
        ssotRegistrationId: record.ssotRegistrationId,
      };
    }),
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

function formatConferenceType(type: string): string {
  const typeMap: Record<string, string> = {
    YP_CHURCH_LIVING: "YP Church Living",
    CAMANAVA_SSOT: "CAMANAVA SSOT",
  };
  return typeMap[type] || type;
}

export async function createFinanceRecord(data: {
  conferenceType: string;
  registrationId?: string;
  ssotRegistrationId?: string;
  billingSettingId: string;
}) {
  if (!data.registrationId && !data.ssotRegistrationId) {
    throw new Error("Either registrationId or ssotRegistrationId is required.");
  }

  // Validate billing setting exists
  const billingSetting = await prisma.billingSetting.findUnique({
    where: { id: data.billingSettingId },
  });

  if (!billingSetting) {
    throw new Error("Invalid billing setting selected.");
  }

  if (!billingSetting.isActive) {
    throw new Error("This billing setting is no longer active.");
  }

  const existingFinance = await prisma.financeRecord.findFirst({
    where: {
      conferenceType: data.conferenceType as any,
      ...(data.registrationId && { registrationId: data.registrationId }),
      ...(data.ssotRegistrationId && { ssotRegistrationId: data.ssotRegistrationId }),
      billingSettingId: data.billingSettingId,
    },
  });

  if (existingFinance) {
    throw new Error("Record already exists. Please check and try again.");
  }

  const record = await prisma.financeRecord.create({
    data: {
      conferenceType: data.conferenceType as any,
      registrationId: data.registrationId || null,
      ssotRegistrationId: data.ssotRegistrationId || null,
      billingSettingId: data.billingSettingId,
    },
  });

  return { success: true, message: "Finance record created successfully.", id: record.id };
}

export async function markAsPaid(id: string) {
  const record = await prisma.financeRecord.findUnique({
    where: { id },
  });

  if (!record) {
    throw new Error("Finance record not found.");
  }

  await prisma.financeRecord.update({
    where: { id },
    data: {
      isPaid: true,
      paidAt: new Date(),
    },
  });

  return { success: true, message: "Marked as paid successfully." };
}

export async function markAsUnpaid(id: string) {
  const record = await prisma.financeRecord.findUnique({
    where: { id },
  });

  if (!record) {
    throw new Error("Finance record not found.");
  }

  await prisma.financeRecord.update({
    where: { id },
    data: {
      isPaid: false,
      paidAt: null,
    },
  });

  return { success: true, message: "Marked as unpaid successfully." };
}

export async function deleteFinanceRecord(id: string) {
  const record = await prisma.financeRecord.findUnique({
    where: { id },
  });

  if (!record) {
    throw new Error("Finance record not found.");
  }

  await prisma.financeRecord.delete({
    where: { id },
  });

  return { success: true, message: "Finance record deleted successfully." };
}

export async function getFinanceRecordById(id: string) {
  const record = await prisma.financeRecord.findUnique({
    where: { id },
    include: {
      BillingSetting: true,
      Registration: {
        include: {
          YoungPeople: { select: { firstName: true, lastName: true } },
        },
      },
      SsotRegistration: {
        include: { GradeLevel: { select: { name: true } } },
      },
    },
  });

  if (!record) {
    throw new Error("Finance record not found.");
  }

  const isSsot = record.conferenceType === "CAMANAVA_SSOT";
  const name = isSsot
    ? `${record.SsotRegistration?.firstName?.toUpperCase() || ""} ${record.SsotRegistration?.lastName?.toUpperCase() || ""}`
    : `${record.Registration?.YoungPeople?.firstName?.toUpperCase() || ""} ${record.Registration?.YoungPeople?.lastName?.toUpperCase() || ""}`;
  const locality = isSsot
    ? formatLocality(record.SsotRegistration?.locality || "")
    : null;
  const rawLocality = isSsot
    ? record.SsotRegistration?.locality || ""
    : "";

  return {
    id: record.id,
    name,
    locality,
    rawLocality,
    conferenceType: record.conferenceType,
    conferenceTypeLabel: formatConferenceType(record.conferenceType),
    feeType: record.BillingSetting.feeType,
    amount: record.BillingSetting.amount,
    isPaid: record.isPaid,
    paidAt: record.paidAt,
    createdAt: record.createdAt,
    registrationId: record.registrationId,
    ssotRegistrationId: record.ssotRegistrationId,
    billingSettingId: record.billingSettingId,
  };
}

export async function updateFinanceRecord(id: string, data: {
  conferenceType: string;
  registrationId?: string;
  ssotRegistrationId?: string;
  billingSettingId: string;
}) {
  const existingRecord = await prisma.financeRecord.findUnique({
    where: { id },
  });

  if (!existingRecord) {
    throw new Error("Finance record not found.");
  }

  const billingSetting = await prisma.billingSetting.findUnique({
    where: { id: data.billingSettingId },
  });

  if (!billingSetting) {
    throw new Error("Invalid billing setting selected.");
  }

  if (!billingSetting.isActive) {
    throw new Error("This billing setting is no longer active.");
  }

  const duplicateRecord = await prisma.financeRecord.findFirst({
    where: {
      id: { not: id },
      conferenceType: data.conferenceType as any,
      billingSettingId: data.billingSettingId,
      ...(data.registrationId && { registrationId: data.registrationId }),
      ...(data.ssotRegistrationId && { ssotRegistrationId: data.ssotRegistrationId }),
    },
  });

  if (duplicateRecord) {
    throw new Error("Record already exists. Please check and try again.");
  }

  await prisma.financeRecord.update({
    where: { id },
    data: {
      conferenceType: data.conferenceType as any,
      registrationId: data.registrationId || null,
      ssotRegistrationId: data.ssotRegistrationId || null,
      billingSettingId: data.billingSettingId,
    },
  });

  return { success: true, message: "Successfully updated." };
}

export async function getFinanceStatistics(conferenceType?: string) {
  const where: Prisma.FinanceRecordWhereInput = {
    ...(conferenceType && conferenceType !== "" && { conferenceType: conferenceType as any }),
  };

  // Use parallel queries for better performance
  const [totalRecords, paidRecords, recordsWithAmounts] = await Promise.all([
    // Count total records
    prisma.financeRecord.count({ where }),
    // Count paid records
    prisma.financeRecord.count({
      where: { ...where, isPaid: true },
    }),
    // Get only the amounts needed for calculation
    prisma.financeRecord.findMany({
      where,
      select: {
        isPaid: true,
        BillingSetting: {
          select: { amount: true },
        },
      },
    }),
  ]);

  const totalUnpaid = totalRecords - paidRecords;

  // Calculate amounts in memory (only for the selected records)
  const totalAmount = recordsWithAmounts.reduce(
    (sum, r) => sum + r.BillingSetting.amount,
    0
  );
  const totalPaidAmount = recordsWithAmounts
    .filter((r) => r.isPaid)
    .reduce((sum, r) => sum + r.BillingSetting.amount, 0);
  const totalUnpaidAmount = totalAmount - totalPaidAmount;

  return {
    totalRecords,
    totalPaid: paidRecords,
    totalUnpaid,
    totalAmount,
    totalPaidAmount,
    totalUnpaidAmount,
  };
}

export async function getSsotFinanceStatisticsByLocality() {
  const ssotRecords = await prisma.financeRecord.findMany({
    where: { conferenceType: "CAMANAVA_SSOT" },
    include: {
      BillingSetting: true,
      SsotRegistration: true,
    },
  });

  const localityStats = new Map<
    string,
    { total: number; paid: number; unpaid: number; amount: number }
  >();

  const localities = ["CALOOCAN_CITY", "MALABON_CITY", "NAVOTAS_CITY", "VALENZUELA_CITY"];
  localities.forEach((loc) => {
    localityStats.set(loc, { total: 0, paid: 0, unpaid: 0, amount: 0 });
  });

  ssotRecords.forEach((record) => {
    // Skip records without SsotRegistration (orphaned records)
    if (!record.SsotRegistration) {
      return;
    }
    const locality = record.SsotRegistration.locality;
    if (locality && localityStats.has(locality)) {
      const stats = localityStats.get(locality)!;
      stats.total++;
      stats.amount += record.BillingSetting.amount;
      if (record.isPaid) {
        stats.paid++;
      } else {
        stats.unpaid++;
      }
    }
  });

  return Array.from(localityStats.entries()).map(([locality, stats]) => ({
    locality: formatLocality(locality),
    total: stats.total,
    paid: stats.paid,
    unpaid: stats.unpaid,
    amount: stats.amount,
  }));
}

export async function getRegistrationsForFinanceDropdown(conferenceType: string, locality?: string) {
  if (conferenceType === "CAMANAVA_SSOT") {
    const ssotRegistrations = await prisma.ssotRegistration.findMany({
      where: locality && locality !== "none" ? { locality: locality as any } : undefined,
      include: { GradeLevel: { select: { name: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return ssotRegistrations.map((reg) => ({
      id: reg.id,
      name: `${reg.firstName.toUpperCase()} ${reg.lastName.toUpperCase()}`,
      locality: formatLocality(reg.locality),
      gradeLevel: reg.GradeLevel.name,
      type: "ssot",
    }));
  } else {
    const registrations = await prisma.registration.findMany({
      include: {
        YoungPeople: { select: { firstName: true, lastName: true } },
        GradeLevel: { select: { name: true } },
      },
      orderBy: {
        YoungPeople: { lastName: "asc" },
      },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      name: `${reg.YoungPeople.firstName.toUpperCase()} ${reg.YoungPeople.lastName.toUpperCase()}`,
      gradeLevel: reg.GradeLevel.name,
      type: "ypcl",
    }));
  }
}
