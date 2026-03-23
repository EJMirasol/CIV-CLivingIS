import { z } from "zod";

const stringToBoolean = z.union([
  z.boolean(),
  z.string().transform((val) => val.toLowerCase() === "true"),
]);

export const SsotBasicHealthInformationSchema = z.object({
  isAllergies: stringToBoolean.optional(),
  allergyDescription: z.string().optional(),
  allergyMedicine: z.string().optional(),
  isHealthCondition: stringToBoolean.optional(),
  healthConditionDescription: z.string().optional(),
  healthConditionMedicine: z.string().optional(),
});

export const SsotRegistrationFormSchema = z.object({
  id: z.string().optional(),
  lastName: z.string({ message: "This field is required." }),
  firstName: z.string({ message: "This field is required." }),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  locality: z.string({ message: "This field is required." }),
  gender: z.string({ message: "This field is required." }),
  gradeLevel: z.string({ message: "This field is required." }),
  remarks: z.string().optional(),
  basicHealthInformation: SsotBasicHealthInformationSchema.optional(),
});

export type SsotRegistrationFormDTO = z.infer<typeof SsotRegistrationFormSchema>;

export const LOCALITY_OPTIONS = [
  { value: "CALOOCAN_CITY", label: "Caloocan City" },
  { value: "MALABON_CITY", label: "Malabon City" },
  { value: "NAVOTAS_CITY", label: "Navotas City" },
  { value: "VALENZUELA_CITY", label: "Valenzuela City" },
] as const;
