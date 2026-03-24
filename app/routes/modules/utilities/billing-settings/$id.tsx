import { redirect } from "react-router";
import { redirectWithSuccess } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { auth } from "~/lib/auth.server";
import { BillingSettingFormSchema } from "~/types/billing-setting.dto";
import { BillingSettingForm } from "~/components/forms/modules/billing-settings/BillingSettingForm";
import { getBillingSettingById, updateBillingSetting, deleteBillingSetting } from "~/lib/server/billing-setting.server";
import type { Route } from "./+types/$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const setting = await getBillingSettingById(params.id);
  return { setting };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteBillingSetting(params.id);
    return redirectWithSuccess("/utilities/billing-settings", "Successfully deleted.");
  }

  const submission = parseWithZod(formData, { schema: BillingSettingFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateBillingSetting(params.id, submission.value);
    return redirectWithSuccess("/utilities/billing-settings", "Successfully updated.");
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to update billing setting"],
    });
  }
}

export default function EditBillingSetting({ loaderData }: Route.ComponentProps) {
  const { setting } = loaderData;

  return (
    <BillingSettingForm
      defaultValues={{
        feeType: setting.feeType,
        conferenceType: setting.conferenceType,
        amount: setting.amount,
        remarks: setting.remarks,
      }}
      isEdit={true}
      redirectPath="/utilities/billing-settings"
    />
  );
}
