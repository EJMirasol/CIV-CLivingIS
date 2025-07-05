import { parseWithZod } from "@conform-to/zod";
import {
  dataWithError,
  redirectWithSuccess,
  redirectWithError,
} from "remix-toast";
import { RegistrationForm } from "~/components/forms/modules/registration/RegistrationForm";
import {
  getAllClassifications,
  getAllGenders,
  getAllGradeLevels,
  getAllHalls,
  register,
} from "~/utils/registration.server";
import { RegistrationFormSchema } from "~/components/forms/modules/registration/dto/registration.dto";
import type { Route } from "./+types/register";

export async function loader({ request }: Route.LoaderArgs) {
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
    return redirectWithSuccess("/", result.message);
  } catch (error: any) {
    if (error.message === "Duplicate") {
      return redirectWithError("/", "Young people already exists");
    }
    console.error(error);
    return { error: "Failed to create application" };
  }
}
