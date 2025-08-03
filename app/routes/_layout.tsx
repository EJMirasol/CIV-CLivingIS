import { IoMdSettings } from "react-icons/io";
import type { Route } from "./+types/_layout";
import { BookHeart, Handshake, Users } from "lucide-react";
import { useState } from "react";
import { Header } from "~/components/layouts/Header";
import { Sidebar } from "~/components/layouts/Sidebar";
import { Outlet } from "react-router";
import { MdSpaceDashboard } from "react-icons/md";

export async function loader({ request }: Route.LoaderArgs) {
  // const auth = serverAuth();
  // const session = await auth.api.getSession({
  //   headers: request.headers,
  // });

  // if (!session) {
  //   throw redirect("/sign-in");
  // }

  // const user = await prisma.user.findUnique({
  //   where: {
  //     id: session.user.id,
  //   },
  //   select: {
  //     firstLogin: true,
  //   },
  // });

  // if (!user?.firstLogin) {
  //   throw redirect("/change-password");
  // }

  // const usersPermission = await getModuleAccessByModuleName(request, "Users");
  // const rolesPermission = await getModuleAccessByModuleName(request, "Roles");
  // const orInvoicePermission = await getModuleAccessByModuleName(
  //   request,
  //   "OR/Invoice Assignment"
  // );
  // const admissionsPermission = await getModuleAccessByModuleName(
  //   request,
  //   "Admissions"
  // );
  // const chartOfAccountsPermission = await getModuleAccessByModuleName(
  //   request,
  //   "Chart of Accounts"
  // );
  // const paymentTermsPermission = await getModuleAccessByModuleName(
  //   request,
  //   "Payment Terms"
  // );
  // //billing-settings items
  // const tuitionPermission = await getModuleAccessByModuleName(
  //   request,
  //   "Tuition Fees"
  // );
  // const otherFeesPermission = await getModuleAccessByModuleName(
  //   request,
  //   "Other Fees"
  // );
  // const miscFeesPermission = await getModuleAccessByModuleName(
  //   request,
  //   "Miscellaneous Fees"
  // );
  // const discountsPermission = await getModuleAccessByModuleName(
  //   request,
  //   "Scholarship/Discounts"
  // );

  // const hasBillingAccess = [
  //   tuitionPermission?.includes("view"),
  //   discountsPermission?.includes("view"),
  //   otherFeesPermission?.includes("view"),
  //   miscFeesPermission?.includes("view"),
  // ].some(Boolean);

  // return data({
  //   session,
  //   permissions: {
  //     users: usersPermission,
  //     billingSettings: hasBillingAccess,
  //     chartOfAccounts: chartOfAccountsPermission,
  //     paymentTerms: paymentTermsPermission,
  //     roles: rolesPermission,
  //     invoice: orInvoicePermission,
  //     admissions: admissionsPermission,
  //   },
  // });
}

export default function DashboardLayout() {
  // const { permissions } = useLoaderData<typeof loader>();
  const sidebarItems = [
    // {
    //   icon: <MdSpaceDashboard className="h-4 w-4" />,
    //   label: "Dashboard",
    //   route: "/dashboard",
    //   key: "dashboard",
    //   subModules: [],
    // },

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
        },
      
      ].filter(Boolean),
    },
  ];
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        sidebarItems={sidebarItems}
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
