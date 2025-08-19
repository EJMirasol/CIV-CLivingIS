import { redirect } from "react-router";
import type { Route } from "./+types/home";
import Login from "./modules/auth/sign-in";

export function meta({}: Route.MetaArgs) {
  return [{ title: "CIV-IS" }];
}
export async function loader() {
  return redirect("/sign-in");
}
export default function Home() {
  return <Login />;
}
