import { z } from "zod";

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
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 1000;
      },
      {
        message: "Maximum members must be a number between 1 and 1000",
      }
    ),
});

export type GroupFormDTO = z.infer<typeof GroupFormSchema>;

export const GroupAssignmentSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required"),
  groupId: z.string().min(1, "Group ID is required"),
});

export type GroupAssignmentDTO = z.infer<typeof GroupAssignmentSchema>;