import { redirect } from "react-router";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import { auth } from "~/lib/auth.server";
import {
  getFinanceRecords,
  createFinanceRecord,
  markAsPaid,
  markAsUnpaid,
  deleteFinanceRecord,
} from "~/lib/server/finance.server";
import { getBillingSettingsForDropdown } from "~/lib/server/billing-setting.server";
import { Plus, Trash2 } from "lucide-react";
import { Link, useLoaderData, useFetcher, Form, useSubmit } from "react-router";
import { DataTable } from "~/components/data-tables/data-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import type { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
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
  billingSettings: Array<{
    label: string;
    value: string;
    feeType: string;
    amount: number;
  }>;
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

  const [records, billingSettings] = await Promise.all([
    getFinanceRecords({
      conferenceType,
      isPaid,
      pageNumber,
      pageSize,
    }),
    getBillingSettingsForDropdown(),
  ]);

  return { records, billingSettings, filters: { conferenceType, isPaid } };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "create") {
      const conferenceType = formData.get("conferenceType") as string;
      const registrationId = formData.get("registrationId") as string;
      const ssotRegistrationId = formData.get("ssotRegistrationId") as string;
      const billingSettingId = formData.get("billingSettingId") as string;

      await createFinanceRecord({
        conferenceType,
        registrationId: registrationId || undefined,
        ssotRegistrationId: ssotRegistrationId || undefined,
        billingSettingId,
      });
      return redirectWithSuccess("/finance/registration", "Finance record created successfully!");
    }

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
    if (intent === "create") {
      return redirectWithError(
        "/finance/registration",
        error instanceof Error ? error.message : "Failed to create finance record."
      );
    }
    return { success: false, error: error instanceof Error ? error.message : "Operation failed" };
  }
}

export default function FinanceRegistration() {
  const { records, billingSettings, filters } = useLoaderData<typeof loader>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedConferenceType, setSelectedConferenceType] = useState("");
  const submit = useSubmit();

  const registrantFetcher = useFetcher();

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setDialogKey((k) => k + 1);
      setSelectedConferenceType("");
    }
  };

  const handleConferenceTypeChange = (_: string, val: string) => {
    setSelectedConferenceType(val);
  };

  useEffect(() => {
    if (selectedConferenceType) {
      registrantFetcher.load(`/finance/registrants?conferenceType=${selectedConferenceType}`);
    }
  }, [selectedConferenceType]);

  const registrantOptions = registrantFetcher.data?.data
    ? registrantFetcher.data.data.map((r: any) => ({
        id: r.id,
        name: `${r.name}${r.locality ? ` - ${r.locality}` : ""}${r.gradeLevel ? ` (${r.gradeLevel})` : ""}`,
      }))
    : [];

  const filteredBillingSettings = selectedConferenceType
    ? billingSettings.filter((s) => {
        const settingType = s.feeType.toLowerCase();
        if (selectedConferenceType === "CAMANAVA_SSOT") {
          return settingType.includes("ssot") || settingType.includes("camanava");
        }
        return settingType.includes("church living") || settingType.includes("yp");
      })
    : billingSettings;

  const billingSettingOptions = filteredBillingSettings.map((s) => ({
    id: s.value,
    name: s.label,
  }));

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
      header: "Actions",
      cell: ({ row }) => {
        const record = row.original;
        const isPaid = record.isPaid;
        return (
          <div className="flex gap-2">
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance - Registration</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Finance Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Finance Record</DialogTitle>
            </DialogHeader>
            <Form method="post" key={dialogKey} className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div>
                <LabelNoGapRequired htmlFor="conferenceType">Conference Type</LabelNoGapRequired>
                <SelectBoxWithSearch
                  id="conferenceType"
                  name="conferenceType"
                  options={conferenceTypeOptions}
                  onSelectValue={handleConferenceTypeChange}
                  placeholder="Select conference type"
                />
              </div>
              <div>
                <LabelNoGapRequired htmlFor="registrantId">Registrant</LabelNoGapRequired>
                <SelectBoxWithSearch
                  key={`registrant-${selectedConferenceType}`}
                  id="registrantId"
                  name={selectedConferenceType === "CAMANAVA_SSOT" ? "ssotRegistrationId" : "registrationId"}
                  options={registrantOptions}
                  disabled={!selectedConferenceType}
                  placeholder={selectedConferenceType ? "Select registrant" : "Select conference type first"}
                />
              </div>
              <div>
                <LabelNoGapRequired htmlFor="billingSettingId">Fee Type</LabelNoGapRequired>
                <SelectBoxWithSearch
                  key={`billing-${selectedConferenceType}`}
                  id="billingSettingId"
                  name="billingSettingId"
                  options={billingSettingOptions}
                  disabled={!selectedConferenceType}
                  placeholder={selectedConferenceType ? "Select fee type" : "Select conference type first"}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Record
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="get" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Conference Type</label>
              <SelectBoxWithSearch
                id="filter-conferenceType"
                name="conferenceType"
                options={conferenceTypeOptions}
                defaultValue={filters.conferenceType}
                placeholder="All Types"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Status</label>
              <SelectBoxWithSearch
                id="filter-isPaid"
                name="isPaid"
                options={[
                  { id: "true", name: "Paid" },
                  { id: "false", name: "Unpaid" },
                ]}
                defaultValue={filters.isPaid}
                placeholder="All Status"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Search</Button>
              <Link to="/finance/registration">
                <Button variant="outline" type="button">
                  Clear
                </Button>
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={records.data}
        pagination={records.pagination}
      />
    </div>
  );
}
