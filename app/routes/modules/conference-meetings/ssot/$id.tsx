import { redirect } from "react-router";
import { parseWithZod } from "@conform-to/zod";
import { redirectWithSuccess } from "remix-toast";
import { auth } from "~/lib/auth.server";
import { SsotRegistrationFormSchema } from "~/types/ssot-registration.dto";
import {
  getSsotRegistrationById,
  getSsotGradeLevels,
  getLocalities,
  getSsotGenders,
  updateSsotRegistration,
} from "~/lib/server/ssot-registration.server";
import { SsotRegistrationForm } from "~/components/forms/modules/ssot-registration/SsotRegistrationForm";
import type { Route } from "./+types/$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");
  if (!params.id) throw redirect("/conference-meetings/ssot/registration");

  const [registration, gradeLevelList, localityList, genderList] = await Promise.all([
    getSsotRegistrationById(params.id),
    getSsotGradeLevels(),
    getLocalities(),
    getSsotGenders(),
  ]);

  return { registration, gradeLevelList, localityList, genderList };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: SsotRegistrationFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateSsotRegistration(params.id, submission.value);
    return redirectWithSuccess(
      "/conference-meetings/ssot/registration",
      "Successfully updated."
    );
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to update"],
    });
  }
}

export default function SsotRegistrationEdit({ loaderData }: Route.ComponentProps) {
  const { registration, gradeLevelList, localityList, genderList } = loaderData;

  return (
    <SsotRegistrationForm
      gradeLevelList={gradeLevelList}
      localityList={localityList}
      genderList={genderList}
      defaultValues={registration}
      isEdit={true}
      redirectPath="/conference-meetings/ssot/registration"
    />
  );
}
