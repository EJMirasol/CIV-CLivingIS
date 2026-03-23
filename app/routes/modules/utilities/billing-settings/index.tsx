import { redirect } from "react-router";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "react-router";
import { Plus, Search, Settings, Trash2, RefreshCcw } from "lucide-react";
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
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { SearchInput } from "~/components/shared/SearchInput";
import { Badge } from "~/components/ui/badge";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import { getBillingSettings, deleteBillingSetting } from "~/lib/server/billing-setting.server";
import { CONFERENCE_TYPE_OPTIONS } from "~/types/billing-setting.dto";
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const args = {
    conferenceType: searchParams.conferenceType || "",
    feeType: searchParams.feeType || "",
    pageNumber: parseInt(searchParams.pageNumber || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortOrder: (searchParams.sortOrder || "asc") as "asc" | "desc",
  };

  const { data, pagination } = await getBillingSettings(args);

  return {
    data,
    pagination,
    searchFilter: args,
    conferenceTypeOptions: CONFERENCE_TYPE_OPTIONS.map((o) => ({
      id: o.value,
      name: o.label,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const intent = formData.get("intent");
  const settingId = formData.get("settingId");

  if (intent === "delete" && settingId) {
    try {
      await deleteBillingSetting(settingId.toString());
      return redirectWithSuccess(
        "/utilities/billing-settings",
        "Successfully Deleted!"
      );
    } catch (error) {
      return { error: "Failed to delete billing setting" };
    }
  }

  return { error: "Invalid action" };
}

export default () => {
  const {
    data,
    pagination,
    searchFilter,
    conferenceTypeOptions,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "feeType",
      header: ({ column }) => (
        <DataTableColumnHeader title="Fee Type" column={column} columnKey="feeType" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 pl-2">
          <span className="text-sm font-medium">{row.original.feeType}</span>
        </div>
      ),
    },
    {
      accessorKey: "conferenceType",
      header: ({ column }) => (
        <DataTableColumnHeader title="Conference Type" column={column} columnKey="conferenceType" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 pl-2">
          <span className="text-sm font-medium">{row.original.conferenceType}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader title="Amount (PHP)" column={column} columnKey="amount" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 pl-2">
          <span className="text-sm font-medium">
            ₱{row.original.amount.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader title="Status" column={column} columnKey="isActive" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 pl-2">
          {row.original.isActive ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: ({}) => (
        <div className="text-center text-Raisinblack font-medium">Actions</div>
      ),
      cell: ({ row }) => (
        <div className="flex gap-2 flex-wrap">
          <Link to={`${row.original.id}`}>
            <Button size="sm" className="bg-[#213b36]" variant="view" type="button">
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
                <DialogTitle>Delete Billing Setting</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>{row.original.feeType}</strong>? This action cannot be undone.
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
                      formData.append("settingId", row.original.id);
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
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">Billing Settings</h1>
      </div>

      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4"
          id="search-billing-form"
          method="GET"
        >
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
            <Label>Fee Type</Label>
            <SearchInput
              name="feeType"
              type="text"
              defaultValue={searchFilter.feeType}
            />
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row justify-start sm:justify-end items-start sm:items-center gap-2 pt-2">
            <Button className="bg-[#213b36]" variant="view" type="submit">
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="view"
              className="border-none bg-[#213b36] text-white"
              onClick={() => {
                navigate("/utilities/billing-settings/");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>

      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/utilities/billing-settings/add">
            <Button className="bg-[#213b36]" variant="view">
              <Plus />
              Add Billing Setting
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
