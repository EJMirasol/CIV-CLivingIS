import { redirect } from "react-router";
import { redirectWithSuccess } from "remix-toast";
import { auth } from "~/lib/auth.server";
import {
  getFinanceRecords,
  markAsPaid,
  markAsUnpaid,
  deleteFinanceRecord,
} from "~/lib/server/finance.server";
import { DollarSign, Plus, Trash2, Search, RefreshCcw } from "lucide-react";
import { Link, useLoaderData, useSubmit, useNavigate } from "react-router";
import { DataTable } from "~/components/data-tables/data-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { FaEye } from "react-icons/fa";
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
import { Label } from "~/components/ui/label";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import type { ColumnDef } from "@tanstack/react-table";
import { Form } from "react-router";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";
import type { Route } from "./+types/index";

interface FinanceRegistration {
  id: string;
  name: string;
  locality: string | null;
  conferenceType: string;
  feeType: string;
  amount: number;
  isPaid: boolean;
  paidAt: Date | string | null;
  createdAt: Date | string;
  registrationId?: string | null;
  ssotRegistrationId?: string | null;
}

interface LoaderData {
  records: {
    data: FinanceRegistration[];
    pagination: {
      pageNumber: number;
      pageSize: number;
      totalCount: number;
    };
  };
  filters: {
    conferenceType: string;
    isPaid: string;
  };
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const url = new URL(request.url);
  const conferenceType = url.searchParams.get("conferenceType") || "";
  const isPaid = url.searchParams.get("isPaid") || "";
  const pageNumber = parseInt(url.searchParams.get("pageNumber") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

  const records = await getFinanceRecords({
    conferenceType,
    isPaid,
    pageNumber,
    pageSize,
  });

  return { records, filters: { conferenceType, isPaid } };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "markPaid") {
      const id = formData.get("id") as string;
      await markAsPaid(id);
      return redirectWithSuccess("/finance/registration", "Marked as paid successfully!");
    }

    if (intent === "markUnpaid") {
      const id = formData.get("id") as string;
      await markAsUnpaid(id);
      return redirectWithSuccess("/finance/registration", "Marked as unpaid successfully!");
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      await deleteFinanceRecord(id);
      return redirectWithSuccess("/finance/registration", "Finance record deleted successfully!");
    }

    return { success: false };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Operation failed" };
  }
}

export default function FinanceRegistration() {
  const { records, filters } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const conferenceTypeOptions = FINANCE_CONFERENCE_TYPE_OPTIONS.map((o) => ({
    id: o.value,
    name: o.label,
  }));

  const columns: ColumnDef<FinanceRegistration>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "locality",
      header: "Locality",
      cell: ({ row }) => row.getValue("locality") || "-",
    },
    {
      accessorKey: "conferenceType",
      header: "Conference Type",
    },
    {
      accessorKey: "feeType",
      header: "Fee Type",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        return `₱${amount.toLocaleString()}`;
      },
    },
    {
      accessorKey: "isPaid",
      header: "Status",
      cell: ({ row }) => {
        const isPaid = row.getValue("isPaid") as boolean;
        return (
          <Badge variant={isPaid ? "default" : "secondary"}>
            {isPaid ? "Paid" : "Unpaid"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: ({}) => (
        <div className="text-center text-Raisinblack font-medium">Actions</div>
      ),
      cell: ({ row }) => {
        const record = row.original;
        const isPaid = record.isPaid;
        return (
          <div className="flex gap-2">
            <Link to={`${record.id}`}>
              <Button size="sm" className="bg-[#213b36]" variant="view" type="button">
                <FaEye className="h-3.5 w-3.5" />
                View
              </Button>
            </Link>
            <Form method="post" className="inline">
              <input type="hidden" name="intent" value={isPaid ? "markUnpaid" : "markPaid"} />
              <input type="hidden" name="id" value={record.id} />
              <Button
                variant={isPaid ? "secondary" : "default"}
                size="sm"
                type="submit"
              >
                {isPaid ? "Mark Unpaid" : "Mark Paid"}
              </Button>
            </Form>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Finance Record</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the finance record for{" "}
                    <strong>{record.name}</strong>? This action cannot be undone.
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
                        formData.append("id", record.id);
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
          <DollarSign className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          FINANCE - REGISTRATION
        </h1>
      </div>

      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4"
          id="search-finance-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Conference Type</Label>
            <SelectBoxWithSearch
              id="conferenceType"
              name="conferenceType"
              options={conferenceTypeOptions}
              defaultValue={filters.conferenceType}
              placeholder="All Types"
            />
          </div>
          <div className="space-y-1">
            <Label>Payment Status</Label>
            <SelectBoxWithSearch
              id="isPaid"
              name="isPaid"
              options={[
                { id: "true", name: "Paid" },
                { id: "false", name: "Unpaid" },
              ]}
              defaultValue={filters.isPaid}
              placeholder="All Status"
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
                navigate("/finance/registration/");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>

      <div className="flex justify-end items-center">
        <Link to="/finance/registration/add">
          <Button className="bg-[#213b36]" variant="view">
            <Plus />
            Add Finance Record
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={records.data}
            pagination={records.pagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
