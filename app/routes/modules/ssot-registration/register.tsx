import { parseWithZod } from "@conform-to/zod";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import { SsotRegistrationFormSchema } from "~/types/ssot-registration.dto";
import { SsotRegistrationForm } from "~/components/forms/modules/ssot-registration/SsotRegistrationForm";
import {
  getSsotGradeLevels,
  getLocalities,
  getSsotGenders,
  registerSsot,
} from "~/lib/server/ssot-registration.server";
import type { Route } from "./+types/register";

export async function loader({ request }: Route.LoaderArgs) {
  const [gradeLevelList, localityList, genderList] = await Promise.all([
    getSsotGradeLevels(),
    getLocalities(),
    getSsotGenders(),
  ]);

  return { gradeLevelList, localityList, genderList };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: SsotRegistrationFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await registerSsot(submission.value);
    return redirectWithSuccess(
      "/ssot-registration/success",
      "Successfully submitted."
    );
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      return redirectWithError(
        "/ssot-registration",
        "Record already exists. Please check and try again."
      );
    }
    console.error(error);
    return redirectWithError(
      "/ssot-registration",
      "Failed to register. Please try again."
    );
  }
}

export default function SsotRegister({ loaderData }: Route.ComponentProps) {
  const { gradeLevelList, localityList, genderList } = loaderData;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#15313F] text-white py-4 px-6 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-lg font-semibold">CAMANAVA SSOT 2026</h1>
          <p className="text-xs text-gray-300">© All right reserved</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4">
        <SsotRegistrationForm
          gradeLevelList={gradeLevelList}
          localityList={localityList}
          genderList={genderList}
          isPublic={true}
        />
      </main>
    </div>
  );
}
