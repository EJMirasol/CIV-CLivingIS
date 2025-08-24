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
  Users,
  Plus,
  Search,
  RefreshCcw,
  Trash2,
  Home,
  Bed,
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
  getAccommodationAssignments,
  removeAccommodationAssignment,
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
  const pageNumber = parseInt(url.searchParams.get("pageNumber") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");

  const assignments = await getAccommodationAssignments({ pageNumber, pageSize });
  
  return { assignments };
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
  const assignmentId = formData.get("assignmentId");

  if (intent === "remove" && assignmentId) {
    try {
      await removeAccommodationAssignment(assignmentId.toString());
      return redirectWithSuccess(
        "/conference-meetings/ypcl/accommodation/assignments",
        "Assignment removed successfully!"
      );
    } catch (error) {
      return redirectWithError(
        "/conference-meetings/ypcl/accommodation/assignments",
        error instanceof Error ? error.message : "Failed to remove assignment"
      );
    }
  }

  return { error: "Invalid action" };
}

export default function AssignmentsIndex() {
  const { assignments } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const columns: ColumnDef<(typeof assignments)[0]>[] = [
    {
      accessorKey: "Registration.YoungPeople.firstName",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Young People Name"
          column={column}
          columnKey="Registration.YoungPeople.firstName"
        />
      ),
      cell: ({ row }) => {
        const yp = row.original.Registration.YoungPeople;
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium uppercase">
              {yp.firstName} {yp.lastName}
            </span>
            <Badge variant="outline" className="text-xs">
              {yp.gender}
            </Badge>
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
          columnKey="Room.name"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{row.original.Room?.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "bedNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Bed Number"
          column={column}
          columnKey="bedNumber"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {row.original.bedNumber ? `Bed #${row.original.bedNumber}` : "Not specified"}
            </span>
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
          columnKey="Registration.Classification.name"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {row.original.Registration.Classification.name}
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
          columnKey="Registration.GradeLevel.name"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm">
              {row.original.Registration.GradeLevel.name}
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
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Assignment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove the accommodation assignment for{" "}
                    <strong>
                      {row.original.Registration.YoungPeople.firstName}{" "}
                      {row.original.Registration.YoungPeople.lastName}
                    </strong>{" "}
                    from room <strong>{row.original.Room?.name}</strong>? This action cannot be undone.
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
                        formData.append("intent", "remove");
                        formData.append("assignmentId", row.original.id);
                        submit(formData, { method: "POST" });
                      }}
                    >
                      Remove
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
          <Users className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">Accommodation Assignments</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {assignments.pagination.totalCount} assignment{assignments.pagination.totalCount !== 1 ? "s" : ""} found
        </div>
        <Link to="create">
          <Button className="bg-[#213b36]" variant="view">
            <Plus className="h-4 w-4" />
            Create Assignment
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={assignments.data}
            pagination={assignments.pagination}
            pageSizeOption={[10, 20, 50, 100]}
          />
        </CardContent>
      </Card>
    </div>
  );
}