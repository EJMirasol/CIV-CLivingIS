import { redirect } from "react-router";
import { redirectWithSuccess, dataWithError } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { auth } from "~/lib/auth.server";
import { ReturnChangeFormSchema } from "~/types/return-change.dto";
import { ReturnChangeForm } from "~/components/forms/modules/return-changes/ReturnChangeForm";
import { createReturnChange } from "~/lib/server/return-change.server";
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
  const submission = parseWithZod(formData, { schema: ReturnChangeFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await createReturnChange(submission.value);
    return redirectWithSuccess("/finance/return-changes", "Return change created successfully!");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create return change.";
    return dataWithError(
      submission.reply({ formErrors: [message] }),
      message
    );
  }
}

export default function AddReturnChange() {
  return <ReturnChangeForm />;
}
