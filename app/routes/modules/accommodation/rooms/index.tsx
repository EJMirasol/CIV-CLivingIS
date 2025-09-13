import { useLoaderData, Link, Form, useNavigate, redirect } from "react-router";
import { Settings, Plus, RefreshCcw, Search, Home } from "lucide-react";
import type { Route } from "./+types/index";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/data-tables/data-table";
import { FaEye } from "react-icons/fa";
import { getGenericRoomsList } from "~/lib/server/generic-accommodation.server";
import { getActiveEventTypes } from "~/lib/server/event-type.server";
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
    name: searchParams.name || "",
    eventTypeId: searchParams.eventTypeId || "",
    isActive: searchParams.isActive === "true" ? true : searchParams.isActive === "false" ? false : undefined,
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder || "asc",
  };

  const [roomsResult, eventTypes] = await Promise.all([
    getGenericRoomsList({
      name: args.name,
      isActive: args.isActive,
      eventTypeId: (args.eventTypeId === "none" || args.eventTypeId === "all" || !args.eventTypeId) ? undefined : args.eventTypeId,
      pageNumber: args.pageNumber,
      pageSize: args.pageSize,
    }),
    getActiveEventTypes(),
  ]);

  return { 
    data: roomsResult.data, 
    pagination: roomsResult.pagination, 
    eventTypes, 
    searchFilter: args 
  };
}

export default function AccommodationRoomsIndex() {
  const { data, pagination, eventTypes, searchFilter } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Room Name"
          column={column}
          columnKey="name"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {row.original.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "EventType.name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Meeting Type"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {row.original.EventType?.name || "General Use"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Status"
          column={column}
          columnKey="isActive"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "bedCount",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Beds"
          column={column}
          columnKey="bedCount"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">{row.original.bedCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "currentOccupancy",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Occupancy"
          column={column}
          columnKey="currentOccupancy"
        />
      ),
      cell: ({ row }) => {
        const current = row.original.currentOccupancy;
        const max = row.original.maxOccupancy;
        const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {current}/{max}
            </span>
            <span className="text-xs text-muted-foreground">({percentage}%)</span>
          </div>
        );
      },
    },
    {
      accessorKey: "accommodationAssignments",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Assignments"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.accommodationAssignments?.length || 0}
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
            <Link to={`/accommodation/rooms/${row.original.id}`}>
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
            <Link to={`/accommodation/rooms/${row.original.id}/edit`}>
              <Button
                size="sm"
                className="bg-[#213b36] hover:bg-[#1a2f29]"
                type="button"
              >
                Edit
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
          ROOM CONFIGURATION
        </h1>
      </div>
      
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-4 gap-x-6 gap-y-4"
          id="search-rooms-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Room Name</Label>
            <Input
              name="name"
              type="text"
              defaultValue={searchFilter.name}
              placeholder="Search rooms..."
            />
          </div>
          
          <div className="space-y-1">
            <Label>Meeting Type</Label>
            <Select name="eventTypeId" defaultValue={searchFilter.eventTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meeting Types</SelectItem>
                <SelectItem value="none">General Use Rooms</SelectItem>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.id} value={eventType.id}>
                    {eventType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                navigate("/accommodation/rooms");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>
      
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/accommodation/rooms/create">
            <Button className="bg-[#213b36]" variant="view">
              <Plus className="h-4 w-4" />
              Configure New Room
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