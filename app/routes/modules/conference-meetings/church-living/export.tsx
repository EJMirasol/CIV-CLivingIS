import type { Route } from "./+types/export";
import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { redirectWithError } from "remix-toast";
import { exportYPCLData } from "~/lib/server/registration.server";
import * as XLSX from "xlsx";

async function handleExport(request: Request) {
  console.log("🔍 Export request started:", request.method, request.url);
  
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    console.log("❌ No session found, redirecting to sign-in");
    throw redirect("/sign-in");
  }

  console.log("✅ Session validated for user");

  try {
    // Get format from URL parameters (for GET) or form data (for POST)
    const url = new URL(request.url);
    let format = url.searchParams.get("format") || "csv";
    
    if (request.method === "POST") {
      const formData = await request.formData();
      format = formData.get("format")?.toString() || format;
    }
    
    console.log("📊 Export format:", format);
    
    // Get search parameters from the request
    const searchParams = Object.fromEntries(url.searchParams.entries());
    console.log("🔍 Search parameters:", searchParams);
    
    const args = {
      hall: searchParams.hall || "",
      ypfirstName: searchParams.ypfirstName || "",
      gender: searchParams.gender || "",
      classification: searchParams.classification || "",
      gradeLevel: searchParams.gradeLevel || "",
    };

    console.log("🔎 Query args:", args);
    console.log("📊 Fetching export data...");
    
    const exportData = await exportYPCLData(args);
    console.log("✅ Export data retrieved:", exportData.length, "records");
    
    if (exportData.length === 0) {
      console.log("❌ No data found for export");
      return redirectWithError("/conference-meetings/ypcl", "No data found to export. Please adjust your search filters.");
    }

    const escapeCSVField = (value: any): string => {
      const stringValue = String(value || "");
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(","),
      ...exportData.map(row => 
        headers.map(header => escapeCSVField(row[header])).join(",")
      )
    ];

    const dateString = new Date().toISOString().split('T')[0];

    // Handle Excel export
    if (format === "xlsx") {
      try {
        console.log("Creating Excel file with", exportData.length, "records");
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        // Set column widths for better formatting
        const colWidths = headers.map(() => ({ wch: 20 }));
        worksheet['!cols'] = colWidths;
        
        // Add worksheet to workbook with a simple name
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registration");
        
        console.log("Workbook created, generating buffer...");
        
        // Generate the Excel file as a Uint8Array (most compatible)
        const excelArrayBuffer = XLSX.write(workbook, { 
          type: 'array', 
          bookType: 'xlsx'
        });

        console.log("Excel buffer created, size:", excelArrayBuffer?.length);

        if (!excelArrayBuffer || excelArrayBuffer.length === 0) {
          throw new Error("Excel file generation resulted in empty buffer");
        }

        // Create filename
        const filename = `YPCL_Export_${dateString}.xlsx`;

        // Create response with simplified headers
        return new Response(excelArrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": excelArrayBuffer.length.toString(),
            "Cache-Control": "no-cache",
          },
        });
        
      } catch (xlsxError) {
        console.error("Excel generation failed:", xlsxError);
        return redirectWithError("/conference-meetings/ypcl", `Excel export failed: ${xlsxError.message}. Please try CSV format instead.`);
      }
    }

    // Handle CSV exports
    let csvContent = csvRows.join("\n");
    let filename = `YPCL_Export_${dateString}.csv`;

    if (format === "excel-csv") {
      csvContent = "\uFEFF" + csvContent;
      filename = `YPCL_Export_Excel_${dateString}.csv`;
    }

    // Convert to UTF-8 bytes for consistent handling
    const csvBytes = new TextEncoder().encode(csvContent);

    return new Response(csvBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": csvBytes.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("❌ Export error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return redirectWithError("/conference-meetings/ypcl", `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  return handleExport(request);
}

export async function action({ request }: Route.ActionArgs) {
  return handleExport(request);
}