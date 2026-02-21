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
  Home,
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
import { IoMdCheckboxOutline } from "react-icons/io";
import { DataTable } from "~/components/data-tables/data-table";
import { DashboardStats } from "~/components/dashboard/DashboardStats";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { SearchInput } from "~/components/shared/SearchInput";
import type { Route } from "./+types/index";
import {
  getAllClassifications,
  getAllGroups,
  getAllBedNumbers,
  getAllGradeLevels,
  getAllHalls,
  getYPCLLists,
  deleteRegistration,
  getDashboardStatistics,
} from "~/lib/server/registration.server";
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
    group: searchParams.group || "",
    bedNumber: searchParams.bedNumber || "",
    classification: searchParams.classification || "",
    gradeLevel: searchParams.gradeLevel || "",
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: (searchParams.sortOrder || "asc") as "asc" | "desc",
  };

  const { data, pagination } = await getYPCLLists(args);
  const statistics = await getDashboardStatistics();
  return {
    groupList: await getAllGroups(),
    bedNumberList: await getAllBedNumbers(),
    gradeLevelList: await getAllGradeLevels(),
    classificationList: await getAllClassifications(),
    hallList: await getAllHalls(),
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
    groupList,
    bedNumberList,
    gradeLevelList,
    classificationList,
    hallList,
    searchFilter,
    statistics,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const url = new URL(window.location.href);
      const exportUrl = new URL(
        "/conference-meetings/ypcl/export",
        window.location.origin
      );
      url.searchParams.forEach((value, key) => {
        exportUrl.searchParams.set(key, value);
      });

      const response = await fetch(exportUrl.toString());

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `YPCL_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
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
          title="Young People Name"
          column={column}
          columnKey="ypfirstName"
        />
      ),
      cell: ({ row }) => {
        const firstName = row.original.ypfirstName || "";
        const middleName = row.original.ypMiddleName || "";
        const lastName = row.original.yplastName || "";
        const suffix = row.original.ypSuffix || "";
        const displayName = `${firstName} ${middleName} ${lastName} ${suffix}`.replace(/\s+/g, ' ').trim();
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium uppercase">
              {displayName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "group",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Group"
          column={column}
          columnKey="group"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">{row.original.group || "No group"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "room",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Room"
          column={column}
          columnKey="room"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">{row.original.room || "No room"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "bedNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Bed #"
          column={column}
          columnKey="bedNumber"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.bedNumber ? `Bed #${row.original.bedNumber}` : "N/A"}
            </span>
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
      accessorKey: "hall",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Hall"
          column={column}
          columnKey="hall"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.hall}
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
                      <strong>{`${row.original.ypfirstName} ${row.original.ypMiddleName || ""} ${row.original.yplastName || ""} ${row.original.ypSuffix || ""}`.replace(/\s+/g, ' ').trim()}</strong>? This action
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
          className="grid grid-cols-4 gap-x-6 gap-y-4"
          id="search-admissions-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Young People Name</Label>
            <SearchInput
              name="ypfirstName"
              type="text"
              defaultValue={searchFilter.ypfirstName}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Hall</Label>
            <SelectBoxWithSearch
              id="hall"
              name="hall"
              options={hallList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.hall}
            />
          </div>

          <div className="space-y-1">
            <Label className="">Group</Label>
            <SelectBoxWithSearch
              id="group"
              name="group"
              options={groupList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.group}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Bed#</Label>
            <SelectBoxWithSearch
              id="bedNumber"
              name="bedNumber"
              options={bedNumberList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.bedNumber}
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
          <div className="col-start-5 row-start-1 row-span-2 flex ml-20 justify-center items-center gap-2">
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
          <Link to="/conference-meetings/ypcl/register/">
            <Button className="bg-[#213b36] " variant="view">
              <IoMdCheckboxOutline /> Register
            </Button>
          </Link>

          <Button
            className="bg-[var(--chart-2)] text-white"
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? (
              <>
                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Export
              </>
            )}
          </Button>
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
