import { Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
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

export default function Dashboard() {
  return (
      <div className="w-full flex flex-1 flex-col gap-4 p-4 lg:p-6">

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-lg font-semibold">
                Dashboard
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
  );
}
