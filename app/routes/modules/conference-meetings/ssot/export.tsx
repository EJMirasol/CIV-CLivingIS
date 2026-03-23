import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { exportSsotData } from "~/lib/server/ssot-registration.server";
import ExcelJS from "exceljs";
import type { Route } from "./+types/export";

async function handleExport(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const url = new URL(request.url);
  const searchParams = {
    name: url.searchParams.get("name") || undefined,
    locality: url.searchParams.get("locality") || undefined,
    gender: url.searchParams.get("gender") || undefined,
    gradeLevel: url.searchParams.get("gradeLevel") || undefined,
  };

  try {
    const data = await exportSsotData(searchParams);

    if (data.length === 0) {
      return Response.json(
        { success: false, message: "No data found to export." },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SSOT Registrations");

    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key,
      width: 20,
    }));
    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="SSOT_Export_${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  return handleExport(request);
}

export async function action({ request }: Route.ActionArgs) {
  return handleExport(request);
}
