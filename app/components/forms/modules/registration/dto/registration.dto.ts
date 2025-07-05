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

export const RegistrationFormSchema = z.object({
  lastName: z.string({ message: "This field is required." }),
  firstName: z.string({ message: "This field is required." }),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  gender: z.string({ message: "This field is required." }),
  dateOfBirth: z.string({ message: "This field is required." }),
  age: z.string({ message: "This field is required." }),
  contactPerson : z.string({ message: "This field is required." }),
  contactRelationship: z.string({ message: "This field is required." }),
  contactNumber: z.string({ message: "This field is required." }),
  image: z.string({ message: "Please upload a photo." }),
  hall: z.string({ message: "This field is required." }),
  classification: z.string({ message: "This field is required." }),
  gradeLevel: z.string({ message: "This field is required." }),
  remarks: z.string().optional(),
  basicHealthInformation: BasicHealthInformationSchema.optional(),
  });
  

  export type RegistrationFormDTO = z.infer<typeof RegistrationFormSchema>;