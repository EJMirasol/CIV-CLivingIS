import { redirect } from "react-router";
import { redirectWithSuccess, dataWithError } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { auth } from "~/lib/auth.server";
import { ExpenseFormSchema } from "~/types/expense.dto";
import { ExpenseForm } from "~/components/forms/modules/expenses/ExpenseForm";
import { getExpenseById, updateExpense, deleteExpense } from "~/lib/server/expense.server";
import type { Route } from "./+types/$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const expense = await getExpenseById(params.id);
  return { expense };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteExpense(params.id);
    return redirectWithSuccess("/finance/expenses", "Successfully deleted.");
  }

  const submission = parseWithZod(formData, { schema: ExpenseFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateExpense(params.id, submission.value);
    return redirectWithSuccess("/finance/expenses", "Successfully updated.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update expense.";
    return dataWithError(
      submission.reply({ formErrors: [message] }),
      message
    );
  }
}

export default function EditExpense({ loaderData }: Route.ComponentProps) {
  const { expense } = loaderData;

  return (
    <ExpenseForm
      defaultValues={{
        name: expense.name,
        conferenceType: expense.conferenceType,
        amount: expense.amount,
      }}
      isEdit={true}
      redirectPath="/finance/expenses"
    />
  );
}
