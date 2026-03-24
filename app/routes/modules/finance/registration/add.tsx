import { redirect } from "react-router";
import { parseWithZod } from "@conform-to/zod";
import { redirectWithSuccess, dataWithError } from "remix-toast";
import { FinanceRecordForm } from "~/components/forms/modules/finance/FinanceRecordForm";
import { getBillingSettingsForDropdown } from "~/lib/server/billing-setting.server";
import { createFinanceRecord } from "~/lib/server/finance.server";
import { FinanceRecordFormSchema } from "~/types/finance-record.dto";
import { auth } from "~/lib/auth.server";
import { getLocalities } from "~/lib/server/ssot-registration.server";
import type { Route } from "./+types/add";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const [billingSettings, localityList] = await Promise.all([
    getBillingSettingsForDropdown(),
    getLocalities(),
  ]);
  return { billingSettings, localityList };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FinanceRecordFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await createFinanceRecord({
      conferenceType: submission.value.conferenceType,
      registrationId: submission.value.registrationId || undefined,
      ssotRegistrationId: submission.value.ssotRegistrationId || undefined,
      billingSettingId: submission.value.billingSettingId,
    });
    return redirectWithSuccess("/finance/registration", "Finance record created successfully!");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create finance record.";
    return dataWithError(
      submission.reply({ formErrors: [message] }),
      message
    );
  }
}

export default function AddFinanceRecord({ loaderData }: Route.ComponentProps) {
  return (
    <FinanceRecordForm billingSettings={loaderData.billingSettings} localityList={loaderData.localityList} />
  );
}
