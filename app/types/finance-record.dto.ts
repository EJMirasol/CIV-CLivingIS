import { z } from "zod";

export const FinanceRecordFormSchema = z.object({
  id: z.string().optional(),
  conferenceType: z.string().min(1, "This field is required."),
  registrationId: z.string().optional(),
  ssotRegistrationId: z.string().optional(),
  billingSettingId: z.string().min(1, "This field is required."),
}).superRefine((data, ctx) => {
  if (!data.conferenceType) return;
  const hasRegistrant = !!(data.registrationId || data.ssotRegistrationId);
  if (!hasRegistrant) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "This field is required.",
      path: ["registrationId"],
    });
  }
});

export type FinanceRecordFormDTO = z.infer<typeof FinanceRecordFormSchema>;

export const FINANCE_CONFERENCE_TYPE_OPTIONS = [
  { value: "YP_CHURCH_LIVING", label: "YP Church Living" },
  { value: "CAMANAVA_SSOT", label: "CAMANAVA SSOT" },
] as const;
