import type { Route } from "./+types/_layout";
import { BookHeart, Handshake, BarChart3, Users } from "lucide-react";
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
          icon: <BarChart3 className="h-4 w-4" />,
          label: "Dashboard",
          route: "conference-meetings/ypcl/dashboard",
        },
        {
          icon: <BookHeart className="h-4 w-4" />,
          label: "YP Church Living",
          route: "conference-meetings/ypcl",
        },
        {
          icon: <Users className="h-4 w-4" />,
          label: "Groups",
          route: "conference-meetings/ypcl/groups",
        },
      ].filter(Boolean),
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

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
