import { useLoaderData, Link, Form, useNavigate, redirect } from "react-router";
import { Settings, Plus, RefreshCcw, Search, Users } from "lucide-react";
import type { Route } from "./+types/index";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/data-tables/data-table";
import { FaEye } from "react-icons/fa";
import { getAccommodationAssignments } from "~/lib/server/accommodation.server";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const args = {
    roomId: searchParams.roomId || "",
    ypfirstName: searchParams.ypfirstName || "",
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder || "asc",
  };

  const { data, pagination } = await getAccommodationAssignments({
    roomId: args.roomId || undefined,
    pageNumber: args.pageNumber,
    pageSize: args.pageSize,
  });

  return {
    data,
    pagination,
    searchFilter: args,
  };
}

export default function AccommodationAssignmentsIndex() {
  const { data, pagination, searchFilter } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "Registration.YoungPeople.firstName",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="YP Name"
          column={column}
          columnKey="ypfirstName"
        />
      ),
      cell: ({ row }) => {
        const firstName = row.original.Registration?.YoungPeople?.firstName || "";
        const lastName = row.original.Registration?.YoungPeople?.lastName || "";
        return (
          <div className="flex items-center gap-2 pl-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {firstName} {lastName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Room.name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Room"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <Badge>{row.original.Room?.name || "N/A"}</Badge>
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
            {row.original.bedNumber ? (
              <Badge variant="outline">Bed {row.original.bedNumber}</Badge>
            ) : (
              <span className="text-sm text-muted-foreground">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "Registration.Classification.name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Classification"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {row.original.Registration?.Classification?.name || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Registration.GradeLevel.name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Grade Level"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {row.original.Registration?.GradeLevel?.name || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "assignedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Assigned Date"
          column={column}
          columnKey="assignedAt"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {new Date(row.original.assignedAt).toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "assignedBy",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Assigned By"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {row.original.assignedBy || "System"}
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
          <div className="flex gap-2">
            <Link to={`/accommodation/rooms/${row.original.roomId}`}>
              <Button
                size="sm"
                className="bg-[#213b36]"
                variant={"view"}
                type="button"
              >
                <FaEye className="h-3.5 w-3.5" />
                View Room
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          ACCOMMODATION ASSIGNMENTS
        </h1>
      </div>
      
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-4 gap-x-6 gap-y-4"
          id="search-assignments-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>YP First Name</Label>
            <Input
              name="ypfirstName"
              type="text"
              defaultValue={searchFilter.ypfirstName}
              placeholder="Search by YP name..."
            />
          </div>
          
          <div className="space-y-1">
            <Label>Room ID</Label>
            <Input
              name="roomId"
              type="text"
              defaultValue={searchFilter.roomId}
              placeholder="Filter by room ID..."
            />
          </div>

          <div className="col-start-4 row-start-1 flex justify-end items-end gap-2">
            <Button className="bg-[#213b36]" variant="view" type="submit">
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="view"
              className="border-none bg-[#213b36] text-white"
              onClick={() => {
                navigate("/accommodation/assignments");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>
      
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/accommodation/assignments/create">
            <Button className="bg-[#213b36]" variant="view">
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
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
}