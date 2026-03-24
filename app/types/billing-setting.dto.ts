import { z } from "zod";

export const BillingSettingFormSchema = z.object({
  id: z.string().optional(),
  feeType: z.string({ message: "This field is required." }),
  conferenceType: z.string({ message: "This field is required." }),
  amount: z
    .string({ message: "This field is required." })
    .min(1, "Amount is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Amount must be a positive number" }
    ),
  remarks: z.string().optional().or(z.literal("")),
});

export type BillingSettingFormDTO = z.infer<typeof BillingSettingFormSchema>;

export const CONFERENCE_TYPE_OPTIONS = [
  { value: "YP_CHURCH_LIVING", label: "YP Church Living" },
  { value: "CAMANAVA_SSOT", label: "CAMANAVA SSOT" },
] as const;
