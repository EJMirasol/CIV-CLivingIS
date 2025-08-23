import { id } from "date-fns/locale";
import { z } from "zod";

const stringToBoolean = z.union([
  z.boolean(),
  z.string().transform((val) => val.toLowerCase() === "true"),
]);
export const BasicHealthInformationSchema = z.object({
  isAllergies: stringToBoolean.optional(),
  allergyDescription: z.string().optional(),
  allergyMedicine: z.string().optional(),
  isHealthCondition: stringToBoolean.optional(),
  healthConditionDescription: z.string().optional(),
  healthConditionMedicine: z.string().optional(),
});

export const ContacPersonEmergencySchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const RegistrationFormSchema = z.object({
  id: z.string().optional(),
  lastName: z.string({ message: "This field is required." }),
  firstName: z.string({ message: "This field is required." }),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  gender: z.string({ message: "This field is required." }),
  dateOfBirth: z.string().optional(),
  age: z.string().optional(),
  image: z.string().optional(),
  hall: z.string({ message: "This field is required." }),
  classification: z.string({ message: "This field is required." }),
  gradeLevel: z.string({ message: "This field is required." }),
  remarks: z.string().optional(),
  basicHealthInformation: BasicHealthInformationSchema.optional(),
  contactPersonEmergency: ContacPersonEmergencySchema.optional(),
});

export type RegistrationFormDTO = z.infer<typeof RegistrationFormSchema>;
