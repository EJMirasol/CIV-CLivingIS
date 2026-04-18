import { z } from "zod";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";

export const GroupFormSchema = z.object({
  name: z
    .string({ required_error: "Group name is required" })
    .min(1, "Group name is required")
    .max(100, "Group name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  maxMembers: z
    .string({ required_error: "Maximum members is required" })
    .min(1, "Maximum members is required")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 1000;
      },
      {
        message: "Maximum members must be a number between 1 and 1000",
      }
    ),
  conferenceType: z.string().min(1, "This field is required."),
});

export type GroupFormDTO = z.infer<typeof GroupFormSchema>;

export const GroupAssignmentFormSchema = z.object({
  groupId: z.string().min(1, "This field is required."),
  conferenceType: z.string().min(1, "This field is required."),
  memberTypeIds: z.array(z.string()),
  gradeLevelIds: z.array(z.string()),
  genderIds: z.array(z.string()),
  memberIds: z.array(z.string()),
}).refine((data) => data.memberIds.some((id) => id.trim() !== ""), {
  message: "Please click 'Add Row' and assign at least one member to the group.",
  path: [],
});

export type GroupAssignmentFormDTO = z.infer<typeof GroupAssignmentFormSchema>;
