import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { getFinanceStatistics, getSsotFinanceStatisticsByLocality } from "~/lib/server/finance.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { Form, useLoaderData, Link } from "react-router";
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
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const url = new URL(request.url);
  const conferenceType = url.searchParams.get("conferenceType") || "";

  const [statistics, localityStats] = await Promise.all([
    getFinanceStatistics(conferenceType),
    getSsotFinanceStatisticsByLocality(),
  ]);

  return { statistics, localityStats, conferenceType };
}

export default function FinanceStatistics() {
  const { statistics, localityStats, conferenceType } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance - Statistics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Conference Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="get" className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Conference Type</label>
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
            <Button type="submit">Filter</Button>
            <Link to="/finance/statistics">
              <Button variant="outline" type="button">
                Clear
              </Button>
            </Link>
          </Form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.totalPaid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.totalUnpaid}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{statistics.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₱{statistics.totalPaidAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Unpaid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₱{statistics.totalUnpaidAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {(!conferenceType || conferenceType === "CAMANAVA_SSOT") && (
        <Card>
          <CardHeader>
            <CardTitle>CAMANAVA SSOT - By Locality</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Locality</TableHead>
                  <TableHead className="text-right">Total Registered</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead className="text-right">Total Unpaid</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
