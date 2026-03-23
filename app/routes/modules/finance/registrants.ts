import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { getRegistrationsForFinanceDropdown } from "~/lib/server/finance.server";
import type { Route } from "./+types/registrants";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const url = new URL(request.url);
  const conferenceType = url.searchParams.get("conferenceType") || "";

  if (!conferenceType) {
    return Response.json({ data: [] });
  }

  const data = await getRegistrationsForFinanceDropdown(conferenceType);
  return Response.json({ data });
}
