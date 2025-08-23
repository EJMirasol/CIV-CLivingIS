import { redirect, useLoaderData } from "react-router";
import { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCcw,
  User,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  getGroupById,
  getAvailableRegistrations,
  assignToGroup,
} from "~/lib/server/groups.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import type { Route } from "./+types/groups.$id.assign";
import { Form, useSubmit, useNavigation } from "react-router";
import { Separator } from "~/components/ui/separator";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { DataTable } from "~/components/data-tables/data-table";
import type { ColumnDef } from "@tanstack/react-table";
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

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  if (!params.id) {
    throw new Response("Group ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const args = {
    search: searchParams.search || "",
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
  };

  try {
    const [group, availableRegistrations] = await Promise.all([
      getGroupById(params.id),
      getAvailableRegistrations(args),
    ]);

    return {
      group,
      availableRegistrations: availableRegistrations.data,
      pagination: availableRegistrations.pagination,
      searchFilter: args,
    };
  } catch (error) {
    throw new Response(
      error instanceof Error ? error.message : "Group not found",
      { status: 404 }
    );
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const registrationId = formData.get("registrationId");

  if (intent === "assign" && registrationId && params.id) {
    try {
      await assignToGroup(registrationId.toString(), params.id);
      return redirectWithSuccess(
        `/conference-meetings/ypcl/groups/${params.id}/assign`,
        "Member assigned to group successfully!"
      );
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to assign member",
      };
    }
  }

  return { error: "Invalid action" };
}

export default function GroupAssign() {
  const { group, availableRegistrations, pagination, searchFilter } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const canAssignMore = group.maxMembers
    ? group.currentMembers < group.maxMembers
    : true;
  
  const remainingSlots = group.maxMembers
    ? group.maxMembers - group.currentMembers
    : null;

  const columns: ColumnDef<(typeof availableRegistrations)[0]>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-medium">{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        return <span>{row.original.gender}</span>;
      },
    },
    {
      accessorKey: "gradeLevel",
      header: "Grade Level",
      cell: ({ row }) => {
        return <span>{row.original.gradeLevel}</span>;
      },
    },
    {
      accessorKey: "classification",
      header: "Classification",
      cell: ({ row }) => {
        return <span>{row.original.classification}</span>;
      },
    },
    {
      accessorKey: "id",
      header: "Actions",
      cell: ({ row }) => {
        const isSelected = selectedMembers.includes(row.original.id);
        return (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#213b36] hover:bg-[#1a2f29]"
                  disabled={!canAssignMore}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Assign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign to Group</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to assign{" "}
                    <strong>{row.original.name}</strong> to the group{" "}
                    <strong>{group.name}</strong>?
                    {remainingSlots && (
                      <span className="block mt-2 text-sm">
                        Remaining slots: {remainingSlots}
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
                      className="bg-[#213b36] hover:bg-[#1a2f29]"
                      onClick={() => {
                        const formData = new FormData();
                        formData.append("intent", "assign");
                        formData.append("registrationId", row.original.id);
                        submit(formData, { method: "POST" });
                      }}
                    >
                      Assign
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-base font-semibold">ASSIGN MEMBERS</h1>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <BackButton />
        </div>
      </div>

      {/* Group Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{group.name}</span>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {group.currentMembers}
                  {group.maxMembers && ` / ${group.maxMembers}`} members
                </span>
              </div>
              {!canAssignMore && (
                <span className="text-red-600 font-medium">
                  Group is at maximum capacity
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {group.description && (
          <CardContent>
            <p className="text-muted-foreground">{group.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Search Card */}
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-3 gap-x-6 gap-y-4"
          id="search-members-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Search Members</Label>
            <Input
              name="search"
              type="text"
              placeholder="Search by name..."
              defaultValue={searchFilter.search}
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
                window.location.href = window.location.pathname;
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>

      {/* Available Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Members ({pagination.totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableRegistrations.length > 0 ? (
            <DataTable
              columns={columns}
              data={availableRegistrations}
              pagination={pagination}
              pageSizeOption={[10, 20, 50]}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No available members found.</p>
              <p className="text-sm">
                {searchFilter.search
                  ? "Try adjusting your search criteria."
                  : "All members are already assigned to groups."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}