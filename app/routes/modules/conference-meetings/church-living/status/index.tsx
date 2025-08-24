import { redirect, useLoaderData, useFetcher, Form, useNavigate } from "react-router";
import { Users, UserCheck, Search, CheckCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

import { 
  getRegistrationList, 
  getAllHalls, 
  getAllClassifications, 
  toggleCheckInStatus 
} from "~/lib/server/registration.server";
import { auth } from "~/lib/auth.server";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { Label } from "~/components/ui/label";
import { DataTable } from "~/components/data-tables/data-table";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import type { Route } from "../+types";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const url = new URL(request.url);
  const searchParams = {
    hall: url.searchParams.get("hall") ?? "",
    ypfirstName: url.searchParams.get("ypfirstName") ?? "",
    group: "", // Required by interface but not used in status module
    bedNumber: "", // Required by interface but not used in status module  
    classification: url.searchParams.get("classification") ?? "",
    gradeLevel: "", // Required by interface but not used in status module
    pageNumber: parseInt(url.searchParams.get("pageNumber") ?? "1"),
    pageSize: parseInt(url.searchParams.get("pageSize") ?? "10"),
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortOrder: (url.searchParams.get("sortOrder") as "asc" | "desc") ?? "asc",
  };

  const [registrations, halls, classifications] = await Promise.all([
    getRegistrationList(searchParams),
    getAllHalls(),
    getAllClassifications(),
  ]);

  return {
    registrations,
    halls,
    classifications,
    searchParams,
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
  const action = formData.get("action");
  const registrationId = formData.get("registrationId") as string;

  if (action === "toggleCheckIn" && registrationId) {
    try {
      const result = await toggleCheckInStatus(registrationId);
      return { success: true, message: result.message, isCheckedIn: result.isCheckedIn };
    } catch (error) {
      return { success: false, message: "Failed to update check-in status" };
    }
  }

  return { success: false, message: "Invalid action" };
}

export default function StatusPage() {
  const { registrations, halls, classifications, searchParams } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const checkedInCount = registrations.data.filter(reg => reg.isCheckedIn).length;
  const totalCount = registrations.data.length;

  const columns: ColumnDef<(typeof registrations.data)[0]>[] = [
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
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium uppercase">
              {row.original.ypfirstName} {row.original.yplastName}
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
            <span className="text-sm font-medium">{row.original.classification}</span>
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
            <span className="text-sm font-medium">{row.original.hall}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isCheckedIn",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Check-in Status"
          column={column}
          columnKey="isCheckedIn"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2 group cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors">
            <div className={`w-3 h-3 rounded-full ${
              row.original.isCheckedIn ? "bg-green-500" : "bg-gray-400"
            }`} />
            {row.original.isCheckedIn ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors">
                <CheckCircle className="h-3 w-3 mr-1" />
                Checked In
              </Badge>
            ) : (
              <Badge variant="secondary" className="hover:bg-gray-300 text-gray-700 hover:text-gray-900 transition-colors">
                Not Checked In
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "checkedInAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Check-in Time"
          column={column}
          columnKey="checkedInAt"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            {row.original.isCheckedIn && row.original.checkedInAt ? (
              <span className="text-xs text-green-600">
                {new Date(row.original.checkedInAt).toLocaleDateString()} {new Date(row.original.checkedInAt).toLocaleTimeString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: () => {
        return (
          <div className="text-center text-Raisinblack font-medium">
            Actions
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="toggleCheckIn" />
              <input type="hidden" name="registrationId" value={row.original.id} />
              <Button
                type="submit"
                size="sm"
                variant={row.original.isCheckedIn ? "outline" : "default"}
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? "..." : 
                  row.original.isCheckedIn ? "Check Out" : "Check In"}
              </Button>
            </fetcher.Form>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md">
            <UserCheck className="h-5 w-5" />
          </div>
          <h1 className="text-base font-semibold">CHECK-IN STATUS & TAGGING</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {checkedInCount} Checked In
          </Badge>
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {totalCount} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-3 gap-x-6 gap-y-4"
          id="search-status-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Yp First Name</Label>
            <Input
              name="ypfirstName"
              type="text"
              defaultValue={searchParams.ypfirstName}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Hall</Label>
            <SelectBoxWithSearch
              id="hall"
              name="hall"
              options={halls.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchParams.hall}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Classification</Label>
            <SelectBoxWithSearch
              id="classification"
              name="classification"
              options={classifications.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchParams.classification}
            />
          </div>
          <div className="col-start-4 row-start-1 row-span-2 flex ml-20 justify-center items-center gap-2">
            <Button className="bg-[#213b36]" variant="view" type="submit">
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="view"
              className="border-none bg-[#213b36] text-white"
              onClick={() => {
                navigate("/conference-meetings/ypcl/status/");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>

      {/* Registration List */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({registrations.pagination.totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={registrations.data}
            pagination={registrations.pagination}
            pageSizeOption={[10, 20, 50, 100]}
            sortBy={searchParams.sortBy}
            sortOrder={searchParams.sortOrder}
          />
        </CardContent>
      </Card>
    </div>
  );
}