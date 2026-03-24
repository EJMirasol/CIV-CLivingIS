import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { getFinanceStatistics, getSsotFinanceStatisticsByLocality } from "~/lib/server/finance.server";
import { getExpenseStatistics } from "~/lib/server/expense.server";
import { getReturnChangeStatistics } from "~/lib/server/return-change.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { Form, useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CircleCheck,
  CircleX,
  Receipt,
  RotateCcw,
  Search,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const url = new URL(request.url);
  const conferenceType = url.searchParams.get("conferenceType") || "";

  const [statistics, localityStats, expenseStats, returnChangeStats] = await Promise.all([
    getFinanceStatistics(conferenceType),
    getSsotFinanceStatisticsByLocality(),
    getExpenseStatistics(conferenceType),
    getReturnChangeStatistics(conferenceType),
  ]);

  return { statistics, localityStats, expenseStats, returnChangeStats, conferenceType };
}

export default function FinanceStatistics() {
  const { statistics, localityStats, expenseStats, returnChangeStats, conferenceType } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const remainingBalance = statistics.totalPaidAmount - expenseStats.totalExpenses - returnChangeStats.totalReturnChanges;
  const collectionRate = statistics.totalRecords > 0
    ? Math.round((statistics.totalPaid / statistics.totalRecords) * 100)
    : 0;
  const remainingPercent = statistics.totalPaidAmount > 0
    ? Math.round((remainingBalance / statistics.totalPaidAmount) * 100)
    : 0;
  const localityTotals = localityStats.reduce(
    (acc: { total: number; paid: number; unpaid: number; amount: number }, stat: any) => ({
      total: acc.total + stat.total,
      paid: acc.paid + stat.paid,
      unpaid: acc.unpaid + stat.unpaid,
      amount: acc.amount + stat.amount,
    }),
    { total: 0, paid: 0, unpaid: 0, amount: 0 }
  );

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <BarChart3 className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          FINANCE - STATISTICS
        </h1>
      </div>

      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4"
          id="search-finance-stats-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Conference Type</Label>
            <SelectBoxWithSearch
              id="stats-conferenceType"
              name="conferenceType"
              options={FINANCE_CONFERENCE_TYPE_OPTIONS.map((o) => ({
                id: o.value,
                name: o.label,
              }))}
              defaultValue={conferenceType}
              placeholder="All Types"
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
              onClick={() => navigate("/finance/statistics")}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>

      {conferenceType && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-2.5 shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Total Records</p>
                    <p className="text-2xl font-bold">{statistics.totalRecords}</p>
                    <p className="text-xs text-gray-400">
                      ₱{statistics.totalAmount.toLocaleString()} total amount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 rounded-full p-2.5 shrink-0">
                    <CircleCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">{statistics.totalPaid}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-gray-400">
                        ₱{statistics.totalPaidAmount.toLocaleString()} collected
                      </p>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        {collectionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 rounded-full p-2.5 shrink-0">
                    <CircleX className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Total Unpaid</p>
                    <p className="text-2xl font-bold text-red-600">{statistics.totalUnpaid}</p>
                    <p className="text-xs text-gray-400">
                      ₱{statistics.totalUnpaidAmount.toLocaleString()} outstanding
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Total Contributions</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    ₱{statistics.totalPaidAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Money collected from paid records</p>
                </div>
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Receipt className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">Total Expenses</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    ₱{expenseStats.totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">Deductions from expenses</p>
                </div>
                <div className="rounded-lg bg-purple-50 border border-purple-100 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <RotateCcw className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700">Total Return Changes</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    ₱{returnChangeStats.totalReturnChanges.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-500 mt-1">Deductions from returns</p>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Remaining Balance</p>
                    <p className={`text-3xl font-bold ${remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ₱{remainingBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${remainingBalance >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {remainingBalance >= 0 ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {remainingPercent}% of contributions
                    </span>
                  </div>
                </div>
                {statistics.totalPaidAmount > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${remainingBalance >= 0 ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${Math.max(0, Math.min(100, remainingPercent))}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">₱0</span>
                      <span className="text-xs text-gray-400">₱{statistics.totalPaidAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {conferenceType === "CAMANAVA_SSOT" && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  CAMANAVA SSOT - BY LOCALITY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Locality</TableHead>
                      <TableHead className="text-right font-semibold">Total Registered</TableHead>
                      <TableHead className="text-right font-semibold">Total Paid</TableHead>
                      <TableHead className="text-right font-semibold">Total Unpaid</TableHead>
                      <TableHead className="text-right font-semibold">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localityStats.map((stat: any) => (
                      <TableRow key={stat.locality}>
                        <TableCell className="font-medium">{stat.locality}</TableCell>
                        <TableCell className="text-right">{stat.total}</TableCell>
                        <TableCell className="text-right">{stat.paid}</TableCell>
                        <TableCell className="text-right">{stat.unpaid}</TableCell>
                        <TableCell className="text-right">
                          ₱{stat.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-gray-300 font-semibold bg-gray-50">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{localityTotals.total}</TableCell>
                      <TableCell className="text-right">{localityTotals.paid}</TableCell>
                      <TableCell className="text-right">{localityTotals.unpaid}</TableCell>
                      <TableCell className="text-right">
                        ₱{localityTotals.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
