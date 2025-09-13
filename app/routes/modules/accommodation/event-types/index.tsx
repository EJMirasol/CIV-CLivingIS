import { useLoaderData, Link, Form, redirect, useNavigate, useSubmit } from "react-router";
import { useState } from "react";
import { Settings, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import type { Route } from "./+types/index";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
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
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/data-tables/data-table";
import { FaEye } from "react-icons/fa";
import { getEventTypesList, deleteEventType } from "~/lib/server/event-type.server";
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

  const args = {
    name: searchParams.name || "",
    isActive: searchParams.isActive === "true" ? true : searchParams.isActive === "false" ? false : undefined,
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder || "asc",
  };

  const { data, pagination } = await getEventTypesList(args);

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

  if (intent === "delete") {
    const id = formData.get("id") as string;
    try {
      await deleteEventType(id);
      return redirectWithSuccess(
        "/accommodation/event-types",
        "Event type deleted successfully!"
      );
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  return { error: "Invalid intent" };
}

export default function EventTypesIndex() {
  const { data, pagination, searchFilter } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Meeting Type Name"
          column={column}
          columnKey="name"
        />
      ),
      cell: ({ row }) => {
        const isYPChurchLiving = row.original.name.toLowerCase().includes('young people church living');
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className={`text-sm font-medium ${
              isYPChurchLiving ? 'text-blue-900' : ''
            }`}>
              {row.original.name}
            </span>
            {isYPChurchLiving && (
              <Badge variant="outline" className="border-blue-500 text-blue-700 text-xs">
                Primary Event
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Description"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm text-muted-foreground max-w-xs truncate">
              {row.original.description || "No description"}
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
      accessorKey: "_count.rooms",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Rooms"
          column={column}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original._count.rooms}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Created"
          column={column}
          columnKey="createdAt"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {new Date(row.original.createdAt).toLocaleDateString()}
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
            <Link to={`/accommodation/event-types/${row.original.id}/edit`}>
              <Button
                size="sm"
                className="bg-[#213b36]"
                variant={"view"}
                type="button"
              >
                <FaEye className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            <Link to={`/accommodation/rooms?eventType=${row.original.id}`}>
              <Button
                size="sm"
                className="bg-[#213b36] hover:bg-[#1a2f29]"
                type="button"
              >
                View Rooms
              </Button>
            </Link>
            {row.original._count.rooms === 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Meeting Type</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the meeting type{" "}
                      <strong>{row.original.name}</strong>? This action cannot be undone.
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
                          formData.append("id", row.original.id);
                          submit(formData, { method: "POST" });
                        }}
                      >
                        Delete
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
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
          MEETING TYPE CONFIGURATION
        </h1>
      </div>
      
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-3 gap-x-6 gap-y-4"
          id="search-event-types-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Meeting Type Name</Label>
            <Input
              name="name"
              type="text"
              defaultValue={searchFilter.name}
              placeholder="Search meeting types..."
            />
          </div>

          <div className="col-start-3 row-start-1 flex justify-end items-end gap-2">
            <Button className="bg-[#213b36]" variant="view" type="submit">
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="view"
              className="border-none bg-[#213b36] text-white"
              onClick={() => {
                navigate("/accommodation/event-types");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>
      
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/accommodation/event-types/create">
            <Button className="bg-[#213b36]" variant="view">
              <Plus className="h-4 w-4" />
              Add New Meeting Type
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