import type { Route } from "./+types/export";
import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { redirectWithError } from "remix-toast";
import { exportYPCLData } from "~/lib/server/registration.server";
import ExcelJS from "exceljs";

async function handleExport(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const args = {
      hall: searchParams.hall || "",
      ypfirstName: searchParams.ypfirstName || "",
      gender: searchParams.gender || "",
      classification: searchParams.classification || "",
      gradeLevel: searchParams.gradeLevel || "",
    };

    const exportData = await exportYPCLData(args);

    if (exportData.length === 0) {
      return redirectWithError(
        "/conference-meetings/ypcl",
        "No data found to export."
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registrations");

    const headers = Object.keys(exportData[0]);
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 20,
    }));

    exportData.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `YPCL_Export_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return redirectWithError(
      "/conference-meetings/ypcl",
      `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  return handleExport(request);
}

export async function action({ request }: Route.ActionArgs) {
  return handleExport(request);
}
