import { redirect, useLoaderData } from "react-router";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
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


      {/* Main Dashboard Statistics */}
      <div className="space-y-6">
        <DashboardStats statistics={statistics} />
      </div>

    </div>
  );
}