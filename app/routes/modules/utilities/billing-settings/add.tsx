import { redirect } from "react-router";
import { redirectWithSuccess } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { auth } from "~/lib/auth.server";
import { BillingSettingFormSchema } from "~/types/billing-setting.dto";
import { BillingSettingForm } from "~/components/forms/modules/billing-settings/BillingSettingForm";
import { createBillingSetting } from "~/lib/server/billing-setting.server";
import type { Route } from "./+types/add";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: BillingSettingFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await createBillingSetting(submission.value);
    return redirectWithSuccess("/utilities/billing-settings", "Billing setting created successfully!");
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to create billing setting"],
    });
  }
}

export default function AddBillingSetting() {
  return <BillingSettingForm />;
}
