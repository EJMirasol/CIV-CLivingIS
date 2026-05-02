import { ClipboardList, Bed, Users, PhilippinePeso, CalendarDays, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { auth } from "~/lib/auth.server";
import { redirect } from "react-router";
import type { Route } from "./+types";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
}

const features = [
  { icon: ClipboardList, label: "Registration", desc: "Participant enrollment & check-in" },
  { icon: Bed, label: "Accommodation", desc: "Room & bed assignments" },
  { icon: Users, label: "Group Assignments", desc: "Team grouping & coordination" },
  { icon: PhilippinePeso, label: "Finance Tracking", desc: "Billing, expenses & returns" },
  { icon: CalendarDays, label: "Event Administration", desc: "Conference scheduling" },
  { icon: ShieldCheck, label: "Access Control", desc: "Authentication & roles" },
];

export default function Dashboard() {
  return (
    <div className="w-full flex flex-1 flex-col gap-6 p-4 lg:p-6">

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#213b36]">REKLAMO</h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">R</span>egistration &middot;{" "}
          <span className="font-semibold">E</span>nvironment &middot;{" "}
          <span className="font-semibold">K</span>itchen &middot;{" "}
          <span className="font-semibold">L</span>iving &middot;{" "}
          <span className="font-semibold">A</span>ccommodation &middot;{" "}
          <span className="font-semibold">M</span>edical &middot;{" "}
          <span className="font-semibold">O</span>verall
        </p>
        <p className="text-sm text-muted-foreground">
          A system for managing Church meetings and conferences.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, label, desc }) => (
          <Card key={label} className="transition-colors duration-200 hover:border-[#213b36]/40">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#213b36]/10">
                <Icon className="h-4.5 w-4.5 text-[#213b36]" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
