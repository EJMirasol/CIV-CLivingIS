import type { Route } from "./+types/_layout";
import { BookHeart, Handshake, BarChart3, Users, UserCheck, UserPlus, Home, Building, Settings, DollarSign, FileText, ClipboardList } from "lucide-react";
import { MdSpaceDashboard } from "react-icons/md";
import { useState, useMemo } from "react";
import { Header } from "~/components/layouts/Header";
import { Sidebar } from "~/components/layouts/Sidebar";
import { Outlet, redirect, useLoaderData } from "react-router";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  return {
    user: session.user,
  };
}

export default function DashboardLayout() {
  const { user } = useLoaderData<typeof loader>();
  const sidebarItems = useMemo(() => [
    {
      icon: <MdSpaceDashboard className="h-4 w-4" />,
      label: "Dashboard",
      route: "/dashboard",
      key: "dashboard",
      subModules: [],
    },
    {
      icon: <Handshake className="h-4 w-4" />,
      label: "Meetings & Conferences",
      route: "",
      key: "conference-meetings",
      subModules: [
        {
          icon: <BookHeart className="h-4 w-4" />,
          label: "YP Church Living",
          route: "conference-meetings/ypcl",
          subModules: [
            {
              icon: <BarChart3 className="h-4 w-4" />,
              label: "Dashboard",
              route: "conference-meetings/ypcl/dashboard",
            },
            {
              icon: <UserPlus className="h-4 w-4" />,
              label: "Registration",
              route: "conference-meetings/ypcl/registration",
            },
            {
              icon: <UserCheck className="h-4 w-4" />,
              label: "Group Assignments",
              route: "conference-meetings/ypcl/group-assignments",
            },
            {
              icon: <Home className="h-4 w-4" />,
              label: "Accommodation Assignments",
              route: "conference-meetings/ypcl/accommodation/assignments",
            },
          ],
        },
        {
          icon: <ClipboardList className="h-4 w-4" />,
          label: "CAMANAVA SSOT",
          route: "conference-meetings/ssot",
          subModules: [
            {
              icon: <BarChart3 className="h-4 w-4" />,
              label: "Dashboard",
              route: "conference-meetings/ssot/dashboard",
            },
            {
              icon: <UserPlus className="h-4 w-4" />,
              label: "Registration",
              route: "conference-meetings/ssot/registration",
            },
          ],
        },
      ],
    },
    {
      icon: <DollarSign className="h-4 w-4" />,
      label: "Finance",
      route: "",
      key: "finance",
      subModules: [
        {
          icon: <FileText className="h-4 w-4" />,
          label: "Registration",
          route: "finance/registration",
        },
        {
          icon: <BarChart3 className="h-4 w-4" />,
          label: "Statistics",
          route: "finance/statistics",
        },
      ],
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Utilities",
      route: "",
      key: "utilities",
      subModules: [
        {
          icon: <Users className="h-4 w-4" />,
          label: "Groups",
          route: "utilities/groups",
        },
        {
          icon: <Building className="h-4 w-4" />,
          label: "Rooms",
          route: "utilities/rooms",
        },
        {
          icon: <DollarSign className="h-4 w-4" />,
          label: "Billing Settings",
          route: "utilities/billing-settings",
        },
      ],
    },
  ], []);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        sidebarItems={sidebarItems}
        user={user}
        setOpen={(val) => {
          setIsSideBarOpen(val);
        }}
      />

      <div className="flex">
        <Sidebar sidebarItems={sidebarItems} isSideBarOpen={isSideBarOpen} />

        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
