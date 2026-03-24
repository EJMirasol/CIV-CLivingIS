import { redirect } from "react-router";
import { redirectWithSuccess, dataWithError } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { auth } from "~/lib/auth.server";
import { ReturnChangeFormSchema } from "~/types/return-change.dto";
import { ReturnChangeForm } from "~/components/forms/modules/return-changes/ReturnChangeForm";
import { getReturnChangeById, updateReturnChange, deleteReturnChange } from "~/lib/server/return-change.server";
import type { Route } from "./+types/$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const returnChange = await getReturnChangeById(params.id);
  return { returnChange };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteReturnChange(params.id);
    return redirectWithSuccess("/finance/return-changes", "Successfully deleted.");
  }

  const submission = parseWithZod(formData, { schema: ReturnChangeFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateReturnChange(params.id, submission.value);
    return redirectWithSuccess("/finance/return-changes", "Successfully updated.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update return change.";
    return dataWithError(
      submission.reply({ formErrors: [message] }),
      message
    );
  }
}

export default function EditReturnChange({ loaderData }: Route.ComponentProps) {
  const { returnChange } = loaderData;

  return (
    <ReturnChangeForm
      defaultValues={{
        name: returnChange.name,
        conferenceType: returnChange.conferenceType,
        amount: returnChange.amount,
      }}
      isEdit={true}
      redirectPath="/finance/return-changes"
    />
  );
}
