import { parseWithZod } from "@conform-to/zod";
import { dataWithError, redirectWithSuccess } from "remix-toast";
import type { Route } from "../../+types/home";
import { RegistrationForm } from "~/components/forms/modules/registration/RegistrationForm";
import {
  getAllClassifications,
  getAllGenders,
  getAllGradeLevels,
  getAllHalls,
  register,
} from "~/utils/registration.server";
import { RegistrationFormSchema } from "~/components/forms/modules/registration/dto/registration.dto";

export async function loader({ request }: Route.LoaderArgs) {
  return {
    gradeLevelList: await getAllGradeLevels().then((data) =>
      data.map((grade: any) => ({ label: grade.name, value: grade.id }))
    ),
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
    await register(submission.value);
    return redirectWithSuccess("/", "Successfully created.");
  } catch (error: any) {
    if (error.message === "Duplicate") {
      return dataWithError(null, "Applicant ID already exists");
    }
    if (error.message === "School year or grade level not found") {
      return dataWithError(null, "School year or grade level not found");
    }
    console.error(error);
    return { error: "Failed to create application" };
  }
}
