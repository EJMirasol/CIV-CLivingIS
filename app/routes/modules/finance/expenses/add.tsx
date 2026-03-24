import { redirect } from "react-router";
import { redirectWithSuccess, dataWithError } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { auth } from "~/lib/auth.server";
import { ExpenseFormSchema } from "~/types/expense.dto";
import { ExpenseForm } from "~/components/forms/modules/expenses/ExpenseForm";
import { createExpense } from "~/lib/server/expense.server";
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
  const submission = parseWithZod(formData, { schema: ExpenseFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await createExpense(submission.value);
    return redirectWithSuccess("/finance/expenses", "Expense created successfully!");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create expense.";
    return dataWithError(
      submission.reply({ formErrors: [message] }),
      message
    );
  }
}

export default function AddExpense() {
  return <ExpenseForm />;
}
