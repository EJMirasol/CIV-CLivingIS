import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
  useNavigation,
} from "react-router";
import { useState } from "react";
import {
  ArrowDownToLine,
  ClipboardList,
  RefreshCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import { FaEye } from "react-icons/fa";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

import { IoMdCheckboxOutline } from "react-icons/io";
import { DataTable } from "~/components/data-tables/data-table";
import { DashboardStats } from "~/components/dashboard/DashboardStats";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import type { Route } from "./+types/index";
import {
  getAllClassifications,
  getAllGenders,
  getAllGradeLevels,
  getYPCLLists,
  deleteRegistration,
  getDashboardStatistics,
} from "~/utils/registration.server";
import { getYear } from "date-fns";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  // Type-safe search parameters with defaults
  const args = {
    hall: searchParams.hall || "",
    ypfirstName: searchParams.ypfirstName || "",
    gender: searchParams.gender || "",
    classification: searchParams.classification || "",
    gradeLevel: searchParams.gradeLevel || "",
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder || "asc",
  };

  const { data, pagination } = await getYPCLLists(args);
  const statistics = await getDashboardStatistics();
  return {
    genderList: await getAllGenders(),
    gradeLevelList: await getAllGradeLevels(),
    classificationList: await getAllClassifications(),
    data,
    pagination,
    searchFilter: args,
    statistics,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const registrationId = formData.get("registrationId");

  if (intent === "delete" && registrationId) {
    try {
      await deleteRegistration(registrationId.toString());
      return redirectWithSuccess(
        "/conference-meetings/ypcl",
        "Sucessfully Deleted!"
      );
    } catch (error) {
      return { error: "Failed to delete registration" };
    }
  }

  return { error: "Invalid action" };
}

export default () => {
  const {
    data,
    pagination,
    genderList,
    gradeLevelList,
    classificationList,
    searchFilter,
    statistics,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [isExporting, setIsExporting] = useState(false);
  
  const [selectedFormat, setSelectedFormat] = useState<string>("csv");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    setIsExportDialogOpen(false);
    
    try {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      
      // Build the export URL with current search parameters and format
      const exportUrl = new URL("/conference-meetings/ypcl/export", window.location.origin);
      searchParams.forEach((value, key) => {
        exportUrl.searchParams.set(key, value);
      });
      exportUrl.searchParams.set("format", selectedFormat);
      
      // Fetch the file as a blob
      const response = await fetch(exportUrl.toString());
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `YPCL_Export_${new Date().toISOString().split('T')[0]}.${selectedFormat === 'xlsx' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "ypfirstName",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="YP First Name"
          column={column}
          columnKey="ypfirstName"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.ypfirstName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Gender"
          column={column}
          columnKey="gender"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">{row.original.gender}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "gradeLevel",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="gradeLevel"
          title="Grade Level"
          column={column}
          columnKey="gradeLevel"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.gradeLevel}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "classification",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Classification"
          column={column}
          columnKey="classification"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.classification}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "id",
      header: ({}) => {
        return (
          <div className="text-center text-Raisinblack font-medium">
            Actions
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <>
            <div className="flex gap-2">
              <Link to={`${row.original.id}`}>
                <Button
                  size="sm"
                  className="bg-[#213b36]"
                  variant={"view"}
                  type="button"
                >
                  <FaEye className="h-3.5 w-3.5" />
                  View
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Registration</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this registration for{" "}
                      <strong>{row.original.ypfirstName}</strong>? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row items-baseline md:justify-end justify-center gap-2">
                    <DialogClose className="w-[70px]" asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose className="w-[70px]" asChild>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const formData = new FormData();
                          formData.append("intent", "delete");
                          formData.append("registrationId", row.original.id);
                          submit(formData, { method: "POST" });
                        }}
                      >
                        Delete
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        );
      },
    },
  ];
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <ClipboardList className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          YP CHURCH LIVING {`${getYear(new Date())}`}
        </h1>
      </div>
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-3 gap-x-6 gap-y-4"
          id="search-admissions-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Yp First Name</Label>
            <Input
              name="ypfirstName"
              type="text"
              defaultValue={searchFilter.ypfirstName}
            />
          </div>

          <div className="space-y-1">
            <Label className="">Gender</Label>
            <SelectBoxWithSearch
              id="gender"
              name="gender"
              options={genderList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.gender}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Grade Level</Label>
            <SelectBoxWithSearch
              id="gradeLevel"
              name="gradeLevel"
              options={gradeLevelList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.gradeLevel}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Classification</Label>
            <SelectBoxWithSearch
              id="classification"
              name="classification"
              options={classificationList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.classification}
            />
          </div>
          <div className="col-start-6 row-start-1 row-span-2 flex ml-20 justify-center items-center gap-2">
            <Button className="bg-[#213b36]" variant="view" type="submit">
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="view"
              className="border-none bg-[#213b36] text-white"
              onClick={() => {
                navigate("/conference-meetings/ypcl/");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/conference-meetings/ypcl/groups">
            <Button className="bg-[#213b36] hover:bg-[#1a2f29]" variant="view">
              <Users className="h-4 w-4" /> Groups
            </Button>
          </Link>
          <Link to="/conference-meetings/ypcl/register/">
            <Button className="bg-[#213b36] " variant="view">
              <IoMdCheckboxOutline /> Register
            </Button>
          </Link>

          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[var(--chart-2)] text-white"
                disabled={isExporting}
                onClick={() => setIsExportDialogOpen(true)}
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5" />
                  Export Data
                </DialogTitle>
                <DialogDescription>
                  Choose the format for exporting church living registration data.
                  {data.length > 0 && (
                    <span className="block mt-1 text-sm font-medium text-foreground">
                      {data.length} record{data.length !== 1 ? 's' : ''} found
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              {data.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">No data available to export.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Export Format</Label>
                    <RadioGroup 
                      value={selectedFormat} 
                      onValueChange={setSelectedFormat}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="csv" id="csv" className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor="csv" className="cursor-pointer font-medium">
                            CSV (Comma Separated Values)
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Standard format compatible with most applications
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="excel-csv" id="excel-csv" className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor="excel-csv" className="cursor-pointer font-medium">
                            Excel Compatible CSV
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            CSV with UTF-8 BOM for proper Excel import
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="xlsx" id="xlsx" className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor="xlsx" className="cursor-pointer font-medium">
                            Excel Workbook (.xlsx)
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Native Excel format with formatting support
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </DialogClose>
                {data.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-[var(--chart-2)] text-white w-full sm:w-auto"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Export {selectedFormat === "excel-csv" ? "Excel CSV" : selectedFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            pagination={pagination}
            pageSizeOption={[10, 20, 50, 100]}
            sortBy={searchFilter.sortBy}
            sortOrder={searchFilter.sortOrder}
          />
        </CardContent>
      </Card>
    </div>
  );
};
