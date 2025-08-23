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
  ClipboardList,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Users,
  UserPlus,
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
import { DataTable } from "~/components/data-tables/data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/groups.index";
import {
  getGroups,
  deleteGroup,
} from "~/utils/groups.server";
import { getYear } from "date-fns";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import { Badge } from "~/components/ui/badge";

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
    name: searchParams.name || "",
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder || "asc",
  };

  const { data, pagination } = await getGroups(args);
  
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
  const groupId = formData.get("groupId");

  if (intent === "delete" && groupId) {
    try {
      await deleteGroup(groupId.toString());
      return redirectWithSuccess(
        "/conference-meetings/ypcl/groups",
        "Group deleted successfully!"
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to delete group" };
    }
  }

  return { error: "Invalid action" };
}

export default () => {
  const {
    data,
    pagination,
    searchFilter,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Group Name"
          column={column}
          columnKey="name"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.name}
            </span>
            {!row.original.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactive
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
      accessorKey: "currentMembers",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Members"
          column={column}
          columnKey="currentMembers"
        />
      ),
      cell: ({ row }) => {
        const current = row.original.currentMembers;
        const max = row.original.maxMembers;
        return (
          <div className="flex items-center gap-2 pl-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {current}
              {max && ` / ${max}`}
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
              <Link to={`${row.original.id}/assign`}>
                <Button
                  size="sm"
                  className="bg-[#213b36] hover:bg-[#1a2f29]"
                  type="button"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Assign
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
                    <DialogTitle>Delete Group</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the group{" "}
                      <strong>{row.original.name}</strong>? 
                      {row.original.currentMembers > 0 
                        ? " This will deactivate the group since it has members."
                        : " This action cannot be undone."
                      }
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
          <Users className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          GROUP MANAGEMENT {`${getYear(new Date())}`}
        </h1>
      </div>
      
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-3 gap-x-6 gap-y-4"
          id="search-groups-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Group Name</Label>
            <Input
              name="name"
              type="text"
              defaultValue={searchFilter.name}
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
                navigate("/conference-meetings/ypcl/groups");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>
      
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/conference-meetings/ypcl/groups/create">
            <Button className="bg-[#213b36]" variant="view">
              <Plus className="h-4 w-4" />
              Create Group
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
};