import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/sign-out";

export async function loader({ request }: Route.LoaderArgs) {
  // Sign out the user by invalidating the session
  const { headers } = await auth.api.signOut({
    returnHeaders: true,
    headers: request.headers,
  });

  // Redirect to sign-in page with the sign-out headers
  return redirect("/sign-in", {
    headers,
  });
}

// This component won't actually render since we redirect in the loader
export default function SignOut() {
  return null;
}
