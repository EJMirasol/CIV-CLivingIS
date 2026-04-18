import { redirect, useLoaderData, Link, useNavigate, useSubmit } from "react-router";
import { Users, UserPlus, Search, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { SearchInput } from "~/components/shared/SearchInput";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/data-tables/data-table";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import { getGroups, deleteGroupAssignment, getMemberTypeOptions } from "~/lib/server/groups.server";
import { auth } from "~/lib/auth.server";
import { Form } from "react-router";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";
import { FaEye } from "react-icons/fa";
import { redirectWithSuccess } from "remix-toast";
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
import type { Route } from "./+types/index";

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
    conferenceType: searchParams.conferenceType || "",
    status: searchParams.status as "full" | "available" | undefined,
    isAssignmentActive: true,
    isAssignmentDeleted: false,
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: (searchParams.sortOrder || "asc") as "asc" | "desc",
  };

  const { data, pagination } = await getGroups(args);

  return {
    data,
    pagination,
    searchFilter: args,
    conferenceTypeOptions: FINANCE_CONFERENCE_TYPE_OPTIONS.map((o) => ({
      id: o.value,
      name: o.label,
    })),
    memberTypeOptions: (await getMemberTypeOptions()).map((o) => ({
      id: o.value,
      name: o.label,
    })),
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
  const groupId = formData.get("groupId");

  if (intent === "delete" && groupId) {
    try {
      await deleteGroupAssignment(groupId.toString());
      return redirectWithSuccess(
        "/conference-meetings/group-assignments",
        "Group assignment deleted successfully!"
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to delete" };
    }
  }

  return { error: "Invalid action" };
}

export default function GroupAssignments() {
  const { data, pagination, searchFilter, conferenceTypeOptions, memberTypeOptions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();

  const statusOptions = [
    { id: "", name: "All" },
    { id: "available", name: "Available" },
    { id: "full", name: "Full" },
  ];

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Group Name"
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
      accessorKey: "conferenceType",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Conference Type"
          column={column}
          columnKey="conferenceType"
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 pl-2">
          <span className="text-sm font-medium">
            {row.original.conferenceType}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "memberTypes",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Composition"
          column={column}
          columnKey="memberTypes"
        />
      ),
      cell: ({ row }) => {
        const memberTypes = row.original.memberTypes;
        if (!memberTypes || memberTypes.length === 0) {
          return <span className="text-sm text-muted-foreground pl-2">—</span>;
        }
        return (
          <div className="flex items-center gap-1 flex-wrap pl-2">
            {memberTypes.map((mt) => (
              <Badge key={mt.type} variant="secondary" className="text-xs">
                {mt.type} ({mt.count})
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "currentMembers",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Group Size"
          column={column}
          columnKey="currentMembers"
        />
      ),
      cell: ({ row }) => {
        const current = row.original.currentMembers;
        const max = row.original.maxMembers || "∞";
        const isFull = row.original.maxMembers && current >= row.original.maxMembers;
        
        return (
          <div className="flex items-center gap-2 pl-2">
            <Badge variant={isFull ? "destructive" : "secondary"}>
              {current} / {max}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Status"
          column={column}
          columnKey="status"
        />
      ),
      cell: ({ row }) => {
        const current = row.original.currentMembers;
        const max = row.original.maxMembers;
        const isFull = max && current >= max;
        
        return (
          <div className="flex items-center gap-2 pl-2">
            {isFull ? (
              <Badge variant="destructive">Full</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Available
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: () => (
        <div className="text-center text-Raisinblack font-medium">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 justify-center">
            <Link to={`/conference-meetings/group-assignments/${row.original.id}`}>
              <Button
                size="sm"
                className="bg-[#213b36]"
                variant="view"
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
                  <DialogTitle>Delete Group Assignment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this group assignment? 
                    The group will still exist in Groups module.
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
                        formData.append("groupId", row.original.id);
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
          <UserPlus className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">GROUP ASSIGNMENTS</h1>
      </div>

      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-4 gap-x-6 gap-y-4"
          id="search-assignments-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Group Name</Label>
            <SearchInput
              name="name"
              type="text"
              defaultValue={searchFilter.name}
              placeholder="Search by group name..."
            />
          </div>
          <div className="space-y-1">
            <Label>Conference Type</Label>
            <SelectBoxWithSearch
              id="conferenceType"
              name="conferenceType"
              options={conferenceTypeOptions}
              defaultValue={searchFilter.conferenceType}
            />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <SelectBoxWithSearch
              id="status"
              name="status"
              options={statusOptions}
              defaultValue={searchFilter.status || ""}
              placeholder="All"
            />
          </div>
          <div className="col-start-1 sm:col-start-4 flex items-end gap-2">
            <Button className="bg-[#213b36]" variant="view" type="submit">
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="view"
              className="border-none bg-[#213b36] text-white"
              onClick={() => {
                navigate("/conference-meetings/group-assignments");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>

      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/conference-meetings/group-assignments/add">
            <Button className="bg-[#213b36]" variant="view">
              <Plus className="h-4 w-4" />
              Add Assignment
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
