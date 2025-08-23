import { redirect, useLoaderData } from "react-router";
import { BarChart3, Users, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DashboardStats } from "~/components/dashboard/DashboardStats";
import type { Route } from "./+types/dashboard";
import { getDashboardStatistics } from "~/lib/server/registration.server";
import { getYear } from "date-fns";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const statistics = await getDashboardStatistics();
  return {
    statistics,
  };
}

export default function YPCLDashboard() {
  const { statistics } = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <BarChart3 className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          YP CHURCH LIVING DASHBOARD {`${getYear(new Date())}`}
        </h1>
      </div>

      {/* Overview Text */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">
            Welcome to the YP Church Living Dashboard. Here you can view comprehensive statistics
            and insights about registrations, demographics, and overall participation for the current year.
          </p>
        </CardContent>
      </Card>

      {/* Main Dashboard Statistics */}
      <div className="space-y-6">
        <DashboardStats statistics={statistics} />
      </div>

      {/* Quick Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              Total number of registered participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              Currently active registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Open</div>
            <p className="text-xs text-muted-foreground">
              Registration is currently open
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Registration Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View all registrations in YP Church Living section</li>
                <li>• Add new registrations using the Register button</li>
                <li>• Export registration data in various formats</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Statistics Overview</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monitor registration trends by demographics</li>
                <li>• Track participation by hall and classification</li>
                <li>• View gender and grade level distributions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}