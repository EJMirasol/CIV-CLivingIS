import { parseWithZod } from "@conform-to/zod";
import { redirect } from "react-router";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import { RegistrationForm } from "~/components/forms/modules/registration/RegistrationForm";
import {
  getAllClassifications,
  getAllGenders,
  getAllGradeLevels,
  getAllHalls,
  register,
} from "~/lib/server/registration.server";
import { RegistrationFormSchema } from "~/types/registration.dto";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types";

export async function loader({ request }: Route.LoaderArgs) {
  // Add authentication check like in the index route
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  return {
    gradeLevelList: await getAllGradeLevels(),
    genderList: await getAllGenders(),
    hallList: await getAllHalls(),
    classificationList: await getAllClassifications(),
  };
}

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <RegistrationForm
      gradeLevelList={loaderData.gradeLevelList}
      genderList={loaderData.genderList}
      hallList={loaderData.hallList}
      classificationList={loaderData.classificationList}
    />
  );
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: RegistrationFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const result = await register(submission.value);
    return redirectWithSuccess(
      "/conference-meetings/ypcl/",
      result.message
    );
  } catch (error: any) {
    if (error.message === "Duplicate") {
      return redirectWithError(
        "/conference-meetings/ypcl/register/",
        "Young people already exists"
      );
    }
    console.error(error);
    return { error: "Failed to create application" };
  }
}
