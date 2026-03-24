import { z } from "zod";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";

export const ExpenseFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "This field is required."),
  amount: z
    .string()
    .min(1, "This field is required.")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Amount must be a positive number" }
    ),
  conferenceType: z.string().min(1, "This field is required."),
});

export type ExpenseFormDTO = z.infer<typeof ExpenseFormSchema>;

export { FINANCE_CONFERENCE_TYPE_OPTIONS as EXPENSE_CONFERENCE_TYPE_OPTIONS };
