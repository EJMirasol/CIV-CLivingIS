import { Link, redirect, useLoaderData } from "react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { Home, Edit, Users, Bed, Calendar } from "lucide-react";
import { DataTable } from "~/components/data-tables/data-table";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import type { Route } from "./+types/$id";
import { getRoomById } from "~/lib/server/accommodation.server";
import { auth } from "~/lib/auth.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  // Handle pagination parameters for current assignments
  const assignmentsPage = parseInt(searchParams.pageNumber || "1");
  const assignmentsPageSize = parseInt(searchParams.pageSize || "10");

  const room = await getRoomById(params.id, assignmentsPage, assignmentsPageSize);
  
  if (!room) {
    throw new Response("Room not found", { status: 404 });
  }

  return { room };
}

type AssignmentData = {
  id: string;
  name: string;
  classification: string;
  gradeLevel: string;
  bedNumber: number | null;
  gender: string;
  notes: string | null;
  assignedAt: Date;
};

export default function RoomDetail() {
  const { room } = useLoaderData<typeof loader>();

  const occupancyPercentage = (room.currentOccupancy / room.maxOccupancy) * 100;

  // Transform assignments data for DataTable
  const assignmentsData: AssignmentData[] = room.accommodationAssignments?.map((assignment) => ({
    id: assignment.id,
    name: `${assignment.Registration.YoungPeople.firstName} ${assignment.Registration.YoungPeople.lastName}`,
    classification: assignment.Registration.Classification.name,
    gradeLevel: assignment.Registration.GradeLevel.name,
    bedNumber: assignment.bedNumber,
    gender: assignment.Registration.YoungPeople.gender,
    notes: assignment.notes,
    assignedAt: new Date(assignment.assignedAt),
  })) || [];

  // Define columns for DataTable
  const columns: ColumnDef<AssignmentData>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Name"
          column={column}
          columnKey="name"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium uppercase">
              {row.original.name}
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
      accessorKey: "gradeLevel",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
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
              {row.original.bedNumber ? `Bed #${row.original.bedNumber}` : "-"}
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
            <Badge variant="outline" className="text-xs">
              {row.original.gender}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "assignedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Assigned At"
          column={column}
          columnKey="assignedAt"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm text-muted-foreground">
              {row.original.assignedAt.toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Notes"
          column={column}
          columnKey="notes"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm text-muted-foreground">
              {row.original.notes || "-"}
            </span>
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
        <h1 className="text-base font-semibold">Room Details: {room.name}</h1>
      </div>

      <div className="flex gap-2">
        <BackButton to="/conference-meetings/ypcl/accommodation/rooms" />
        <Link to="edit">
          <Button className="bg-[#213b36]" variant="view">
            <Edit className="h-4 w-4" />
            Edit Room
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bed Count</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.bedCount}</div>
            <p className="text-xs text-muted-foreground">Total beds available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {room.currentOccupancy}/{room.maxOccupancy}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  occupancyPercentage === 100
                    ? "destructive"
                    : occupancyPercentage > 80
                    ? "secondary"
                    : "default"
                }
              >
                {occupancyPercentage.toFixed(0)}%
              </Badge>
              <p className="text-xs text-muted-foreground">occupied</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={room.isActive ? "default" : "secondary"}
              className="text-sm"
            >
              {room.isActive ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Created {new Date(room.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Assignments</CardTitle>
            {room.assignmentsPagination && room.assignmentsPagination.totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {room.assignmentsPagination.totalCount} total
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {assignmentsData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No assignments yet</p>
            ) : (
              <DataTable
                columns={columns}
                data={assignmentsData}
                pagination={room.assignmentsPagination}
                pageSizeOption={[10, 20, 50, 100]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}