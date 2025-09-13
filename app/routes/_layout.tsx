import type { Route } from "./+types/_layout";
import { BookHeart, Handshake, BarChart3, Users, UserCheck, UserPlus, Home, Building } from "lucide-react";
import { MdSpaceDashboard } from "react-icons/md";
import { useState } from "react";
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
  const sidebarItems = [
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
              route: "conference-meetings/ypcl",
            },
            {
              icon: <Users className="h-4 w-4" />,
              label: "Groups",
              route: "conference-meetings/ypcl/groups",
            },
            {
              icon: <UserCheck className="h-4 w-4" />,
              label: "Check-in Status",
              route: "conference-meetings/ypcl/status",
            },
            {
              icon: <Home className="h-4 w-4" />,
              label: "Accommodation",
              route: "",
              subModules: [
                {
                  icon: <Home className="h-4 w-4" />,
                  label: "Overview",
                  route: "conference-meetings/ypcl/accommodation",
                },
                {
                  icon: <Home className="h-4 w-4" />,
                  label: "Room Management",
                  route: "conference-meetings/ypcl/accommodation/rooms",
                },
                {
                  icon: <Users className="h-4 w-4" />,
                  label: "Assignments",
                  route: "conference-meetings/ypcl/accommodation/assignments",
                },
              ],
            },
          ],
        },
      ],
    },
  ];
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
