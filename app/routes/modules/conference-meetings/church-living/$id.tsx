import { parseWithZod } from "@conform-to/zod";
import { redirect } from "react-router";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import {
  getAllClassifications,
  getAllGenders,
  getAllGradeLevels,
  getAllHalls,
  getRegistrationById,
  updateRegistration,
} from "~/lib/server/registration.server";
import { RegistrationFormSchema } from "~/types/registration.dto";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/$id";
import { RegistrationViewEditForm } from "~/components/forms/modules/registration/RegistrationViewEditForm";

export async function loader({ request, params }: Route.LoaderArgs) {
  // Add authentication check
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const { id } = params;
  if (!id) {
    throw redirect("/conference-meetings/ypcl/");
  }

  try {
    const [registrationData, gradeLevelList, genderList, hallList, classificationList] = await Promise.all([
      getRegistrationById(id),
      getAllGradeLevels(),
      getAllGenders(),
      getAllHalls(),
      getAllClassifications(),
    ]);

    return {
      registrationData,
      gradeLevelList,
      genderList,
      hallList,
      classificationList,
    };
  } catch (error) {
    console.error("Error loading registration:", error);
    throw redirect("/conference-meetings/ypcl/");
  }
}

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <RegistrationViewEditForm
      registrationData={loaderData.registrationData}
      gradeLevelList={loaderData.gradeLevelList}
      genderList={loaderData.genderList}
      hallList={loaderData.hallList}
      classificationList={loaderData.classificationList}
    />
  );
};

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const { id } = params;
  if (!id) {
    throw redirect("/conference-meetings/ypcl/");
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: RegistrationFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const result = await updateRegistration(id, submission.value);
    return redirectWithSuccess(
      `/conference-meetings/ypcl/${id}`,
      result.message
    );
  } catch (error: any) {
    if (error.message === "Duplicate") {
      return redirectWithError(
        `/conference-meetings/ypcl/${id}`,
        "Young person with the same name and date of birth already exists"
      );
    }
    console.error(error);
    return { error: "Failed to update registration" };
  }
}