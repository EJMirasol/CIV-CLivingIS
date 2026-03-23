import { redirect, useLoaderData } from "react-router";
import { BarChart3 } from "lucide-react";
import { SsotDashboardStats } from "~/components/dashboard/SsotDashboardStats";
import type { Route } from "./+types/index";
import { getSsotDashboardStatistics } from "~/lib/server/ssot-registration.server";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const statistics = await getSsotDashboardStatistics();
  return {
    statistics,
  };
}

export default function SsotDashboard() {
  const { statistics } = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <BarChart3 className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          CAMANAVA SSOT DASHBOARD 2026
        </h1>
      </div>

      {/* Main Dashboard Statistics */}
      <div className="space-y-6">
        <SsotDashboardStats statistics={statistics} />
      </div>
    </div>
  );
}
