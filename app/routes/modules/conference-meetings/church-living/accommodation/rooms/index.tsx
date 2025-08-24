import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "react-router";
import { useState } from "react";
import {
  Home,
  Plus,
  Search,
  RefreshCcw,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
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
import { DataTable } from "~/components/data-tables/data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import type { Route } from "./+types/index";
import {
  getRoomsList,
  deleteRoom,
} from "~/lib/server/accommodation.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

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
    isActive: searchParams.isActive ? searchParams.isActive === "true" : undefined,
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy || "name",
    sortOrder: (searchParams.sortOrder as "asc" | "desc") || "asc",
  };

  const { data, pagination } = await getRoomsList(args);
  
  return {
    data,
    pagination,
    searchFilter: args,
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
  const roomId = formData.get("roomId");

  if (intent === "delete" && roomId) {
    try {
      await deleteRoom(roomId.toString());
      return redirectWithSuccess(
        "/conference-meetings/ypcl/accommodation/rooms",
        "Room deleted successfully!"
      );
    } catch (error) {
      return redirectWithError(
        "/conference-meetings/ypcl/accommodation/rooms",
        error instanceof Error ? error.message : "Failed to delete room"
      );
    }
  }

  return { error: "Invalid action" };
}

export default function RoomsIndex() {
  const { data, pagination, searchFilter } = useLoaderData<typeof loader>();
  const submit = useSubmit();
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
            <span className="text-sm font-medium">{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "bedCount",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Bed Count"
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
      accessorKey: "maxOccupancy",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Max Occupancy"
          column={column}
          columnKey="maxOccupancy"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">{row.original.maxOccupancy}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "currentOccupancy",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Current Occupancy"
          column={column}
          columnKey="currentOccupancy"
        />
      ),
      cell: ({ row }) => {
        const current = row.original.currentOccupancy;
        const max = row.original.maxOccupancy;
        const percentage = (current / max) * 100;
        
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {current}/{max}
            </span>
            <Badge
              variant={percentage === 100 ? "destructive" : percentage > 80 ? "secondary" : "default"}
            >
              {percentage.toFixed(0)}%
            </Badge>
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
            <Link to={`${row.original.id}`}>
              <Button size="sm" className="bg-[#213b36]" variant="view">
                <Users className="h-3.5 w-3.5" />
                View
              </Button>
            </Link>
            <Link to={`${row.original.id}/edit`}>
              <Button size="sm" variant="outline">
                <Edit className="h-3.5 w-3.5" />
                Edit
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
                  <DialogTitle>Delete Room</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete room{" "}
                    <strong>{row.original.name}</strong>? This action cannot be undone.
                    {row.original.currentOccupancy > 0 && (
                      <span className="block mt-2 text-red-600 font-medium">
                        Warning: This room currently has {row.original.currentOccupancy} assigned registrant(s).
                        You must remove all assignments before deleting the room.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row items-baseline md:justify-end justify-center gap-2">
                  <DialogClose className="w-[70px]" asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose className="w-[70px]" asChild>
                    <Button
                      variant="destructive"
                      disabled={row.original.currentOccupancy > 0}
                      onClick={() => {
                        const formData = new FormData();
                        formData.append("intent", "delete");
                        formData.append("roomId", row.original.id);
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
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <Home className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">Room Management</h1>
      </div>

      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-3 gap-x-6 gap-y-4"
          id="search-rooms-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Room Name</Label>
            <Input
              name="name"
              type="text"
              defaultValue={searchFilter.name}
              placeholder="Search by room name..."
            />
          </div>
          <div className="col-start-3 row-start-1 flex justify-end items-center gap-2">
            <Button className="bg-[#213b36]" variant="view" type="submit">
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="view"
              className="border-none bg-[#213b36] text-white"
              onClick={() => {
                navigate("/conference-meetings/ypcl/accommodation/rooms");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>

      <div className="flex justify-end items-center">
        <Link to="create">
          <Button className="bg-[#213b36]" variant="view">
            <Plus className="h-4 w-4" />
            Create Room
          </Button>
        </Link>
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