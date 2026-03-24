import { parseWithZod } from "@conform-to/zod";
import { redirect } from "react-router";
import { redirectWithSuccess, dataWithError } from "remix-toast";
import {
  getFinanceRecordById,
  updateFinanceRecord,
} from "~/lib/server/finance.server";
import { getBillingSettingsForDropdown } from "~/lib/server/billing-setting.server";
import { getLocalities } from "~/lib/server/ssot-registration.server";
import { FinanceRecordFormSchema } from "~/types/finance-record.dto";
import { auth } from "~/lib/auth.server";
import { FinanceRecordViewEditForm } from "~/components/forms/modules/finance/FinanceRecordViewEditForm";
import type { Route } from "./+types/$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const { id } = params;
  if (!id) throw redirect("/finance/registration");

  try {
    const [financeRecordData, billingSettings, localityList] = await Promise.all([
      getFinanceRecordById(id),
      getBillingSettingsForDropdown(),
      getLocalities(),
    ]);

    return { financeRecordData, billingSettings, localityList };
  } catch (error) {
    console.error("Error loading finance record:", error);
    throw redirect("/finance/registration");
  }
}

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <FinanceRecordViewEditForm
      financeRecordData={loaderData.financeRecordData}
      billingSettings={loaderData.billingSettings}
      localityList={loaderData.localityList}
    />
  );
};

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const { id } = params;
  if (!id) throw redirect("/finance/registration");

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FinanceRecordFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const result = await updateFinanceRecord(id, {
      conferenceType: submission.value.conferenceType,
      registrationId: submission.value.registrationId || undefined,
      ssotRegistrationId: submission.value.ssotRegistrationId || undefined,
      billingSettingId: submission.value.billingSettingId,
    });
    return redirectWithSuccess("/finance/registration", result.message);
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Failed to update finance record.";
    return dataWithError(
      submission.reply({ formErrors: [message] }),
      message
    );
  }
}
