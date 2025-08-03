import { CalendarIcon, ClipboardList } from "lucide-react";
import { Form, Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  getFormProps,
  useForm,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react";
import { RegistrationFormSchema } from "./dto/registration.dto";
import { parseWithZod } from "@conform-to/zod";
import { SaveButton } from "~/components/shared/buttons/SaveButton";
import { Card, CardContent } from "~/components/ui/card";
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format, parseISO, isValid } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import { Textarea } from "~/components/ui/textarea";
import { useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { ImageUploader } from "~/components/shared/imageUpload/ImageUploader";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { DeleteConfirmationDialog } from "~/components/shared/dialogs/DeleteConfirmationDialog";

interface RegistrationFormProps {
  gradeLevelList: {
    value: string;
    label: string;
  }[];
  genderList: {
    value: string;
    label: string;
  }[];
  hallList: {
    value: string;
    label: string;
  }[];
  classificationList: {
    value: string;
    label: string;
  }[];
}
export function RegistrationForm({
  gradeLevelList,
  genderList,
  hallList,
  classificationList,
}: RegistrationFormProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RegistrationFormSchema });
    },
    shouldValidate: "onSubmit",
    defaultValue: {},
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const handleImageCropped = (blob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;

      if (imageInputRef.current) {
        imageInputRef.current.value = base64String;
      }
    };
    reader.readAsDataURL(blob);
  };

  const handleImageRemoved = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const basicHealthField = fields.basicHealthInformation || {};
  const basicHealthFieldList = basicHealthField.getFieldset();
  const contacPersonEmergencyField = fields.contactPersonEmergency || {};
  const contacPersonEmergencyFieldList =
    contacPersonEmergencyField.getFieldset();

  // Add state for isAllergies and isHealthCondition
  const [isAllergies, setIsAllergies] = useState(
    basicHealthFieldList.isAllergies.value === undefined
      ? undefined
      : String(basicHealthFieldList.isAllergies.value)
  );
  const [isHealthCondition, setIsHealthCondition] = useState(
    basicHealthFieldList.isHealthCondition.value === undefined
      ? undefined
      : String(basicHealthFieldList.isHealthCondition.value)
  );

  // Utility function to calculate age from date string
  function calculateAge(dateString: string): string {
    if (!dateString) return "";
    const today = new Date();
    const birthDate = parseISO(dateString);
    if (!isValid(birthDate)) return "";
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  // State for age, synced with dateOfBirth
  const [calculatedAge, setCalculatedAge] = useState(
    calculateAge(fields.dateOfBirth.value || "")
  );

  // Initialize date from fields.dateOfBirth.value if it exists
  useEffect(() => {
    if (fields.dateOfBirth.value) {
      const parsedDate = parseISO(fields.dateOfBirth.value);
      if (isValid(parsedDate)) {
        setDate(parsedDate);
      }
    }
  }, []);

  // Sync calculatedAge if form is reset or dateOfBirth changes externally
  useEffect(() => {
    const age = calculateAge(fields.dateOfBirth.value || "");
    setCalculatedAge(age);
    form.update({ name: "age", value: age });
  }, [fields.dateOfBirth.value]);

  // Update date state when a date is selected from the calendar
  useEffect(() => {
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      form.update({ name: "dateOfBirth", value: dateString });
    }
  }, [date]);

  // Function to transform input to uppercase
  const transformToUppercase = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
  };

  return (
    <div className="bg-gray-50">
      <div className="w-full flex flex-col">
        {/* header of the Application Form */}
        <div className="ml-4 py-5 flex justify-between flex-row items-center">
          <div className="flex items-center">
            <div className="rounded-md">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-[#15313F] font-[500]">REGISTRATION FORM</span>
          </div>
          <div className="flex items-center gap-2">
            <SaveButton formId={form.id} />
            <DeleteConfirmationDialog redirectPath="/" />
          </div>
        </div>
        <Form
          className="space-y-5 w-full"
          method="post"
          {...getFormProps(form)}
        >
          <Card className="px-5 flex flex-col w-full">
            <div className="text-xs h-full">
              <p>
                Please fill out all the required fields marked with{" "}
                <span className="text-red-500">*</span>, and leave optional
                fields blank.
              </p>
            </div>

            <CardContent className="px-0 pt-44 xl:pt-0">
              {/* Main content */}
              <div className="mt-5">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 relative">
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.lastName.id}>
                        Last Name
                      </LabelNoGapRequired>
                      <Input
                        {...getInputProps(fields.lastName, { type: "text" })}
                        maxLength={50}
                        onInput={transformToUppercase}
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.lastName.errors}
                    </span>
                  </div>

                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.firstName.id}>
                        First Name
                      </LabelNoGapRequired>
                      <Input
                        {...getInputProps(fields.firstName, { type: "text" })}
                        maxLength={50}
                        onInput={transformToUppercase}
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.firstName.errors}
                    </span>
                  </div>

                  <div>
                    <div className="space-y-1">
                      <Label htmlFor={fields.middleName.id}>Middle Name</Label>
                      <Input
                        {...getInputProps(fields.middleName, { type: "text" })}
                        maxLength={50}
                        onInput={transformToUppercase}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={fields.suffix.id}>Suffix</Label>
                    <Input
                      className="max-w-full xl:max-w-[100px] 2xl:max-w-[130px]"
                      {...getInputProps(fields.suffix, { type: "text" })}
                      maxLength={20}
                      onInput={transformToUppercase}
                    />
                  </div>

                  <div className="absolute -top-50 md:-top-50 lg:-top-50 xl:-top-1 xl:-right-1 2xl:right-5">
                    <input
                      ref={imageInputRef}
                      {...getInputProps(fields.image, { type: "hidden" })}
                    />
                    <ImageUploader
                      aspectRatio={100 / 100}
                      maxSize={10 * 1024 * 1024} // 10MB
                      acceptedFileTypes={["image/jpeg", "image/png"]}
                      placeholder="Upload your 1x1 photo."
                      onImageCropped={handleImageCropped}
                      onImageRemoved={handleImageRemoved}
                      imageError={fields.image?.errors ? true : false}
                      className="w-[145px] h-[145px] md:w-[145px] md:h-[145px] lg:w-[145px] lg:h-[145px] xl:w-[150px] xl:h-[150px]"
                    />
                  </div>
                </div>

                <div className="grid xl:grid-cols-4 gap-5 mt-5">
                  <div className="">
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.gender.id}>
                        Gender
                      </LabelNoGapRequired>
                      <SelectBoxWithSearch
                        {...getInputProps(fields.gender, { type: "text" })}
                        error={fields.gender.errors ? true : false}
                        options={genderList.map((opt) => ({
                          id: opt.value,
                          name: opt.label,
                        }))}
                      />
                      {fields.gender.errors && (
                        <div className="text-red-500 text-xs mt-[1px]">
                          {fields.gender.errors}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.gradeLevel.id}>
                        Grade Level
                      </LabelNoGapRequired>
                      <SelectBoxWithSearch
                        {...getInputProps(fields.gradeLevel, { type: "text" })}
                        options={gradeLevelList.map((opt) => ({
                          id: opt.value,
                          name: opt.label,
                        }))}
                        error={fields.gradeLevel.errors ? true : false}
                      />
                      {fields.gradeLevel.errors && (
                        <div className="text-red-500 text-xs mt-[1px]">
                          {fields.gradeLevel.errors}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.dateOfBirth.id}>
                        Date of Birth
                      </LabelNoGapRequired>
                      <input
                        {...getInputProps(fields.dateOfBirth, {
                          type: "hidden",
                        })}
                        value={date ? date.toISOString().split("T")[0] : ""}
                        readOnly
                      />
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger
                          className={`${
                            fields.dateOfBirth.errors ? "border-red-500" : ""
                          }`}
                          asChild
                        >
                          <Button
                            variant="outline"
                            id="date"
                            className="w-full justify-between font-normal"
                            type="button"
                          >
                            {date
                              ? format(date, "MMMM d, yyyy")
                              : "Select date"}
                            <CalendarIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(selectedDate) => {
                              setDate(selectedDate);
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.dateOfBirth.errors}
                    </span>
                  </div>
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.age.id}>
                        Age
                      </LabelNoGapRequired>
                      <Input
                        {...getInputProps(fields.age, { type: "text" })}
                        maxLength={3}
                        className="max-w-full xl:max-w-[100px] 2xl:max-w-[130px]"
                        value={calculatedAge}
                        readOnly
                      />
                      <span className="text-red-500 text-xs">
                        {fields.age.errors}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <LabelNoGapRequired htmlFor={fields.hall.id}>
                      Hall
                    </LabelNoGapRequired>
                    <SelectBoxWithSearch
                      {...getInputProps(fields.hall, { type: "text" })}
                      error={fields.hall.errors ? true : false}
                      options={hallList.map((opt) => ({
                        id: opt.value,
                        name: opt.label,
                      }))}
                    />
                    {fields.hall.errors && (
                      <div className="text-red-500 text-xs mt-[1px]">
                        {fields.hall.errors}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <LabelNoGapRequired htmlFor={fields.classification.id}>
                      Classification
                    </LabelNoGapRequired>
                    <SelectBoxWithSearch
                      {...getInputProps(fields.classification, {
                        type: "text",
                      })}
                      error={fields.classification.errors ? true : false}
                      options={classificationList.map((opt) => ({
                        id: opt.value,
                        name: opt.label,
                      }))}
                    />
                    {fields.classification.errors && (
                      <div className="text-red-500 text-xs mt-[1px]">
                        {fields.classification.errors}
                      </div>
                    )}
                  </div>

                  <div className="xl:col-span-4">
                    <div className="space-y-1">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        className="resize-none"
                        {...getTextareaProps(fields.remarks)}
                        maxLength={50}
                        placeholder="Type your remarks here."
                        id="remarks"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.value = target.value.toUpperCase();
                        }}
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.remarks.errors}
                    </span>
                  </div>

                  {/* Basic Health Information Section */}
                  <div className="xl:col-span-3">
                    <div className="text-base text-[#181919] font-semibold mb-2">
                      Basic Health Information
                      <p className="text-gray-400 font-semibold mt-2">
                        Allergies
                      </p>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-5 col-span-2 gap-5">
                      <div className=" space-y-1">
                        <Label htmlFor={basicHealthFieldList.isAllergies.id}>
                          With Allergy?
                        </Label>
                        <RadioGroup
                          name={basicHealthFieldList.isAllergies.name}
                          className="flex flex-row gap-5"
                          defaultValue={String(
                            basicHealthFieldList.isAllergies.value || ""
                          )}
                          onValueChange={(value) => setIsAllergies(value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="true"
                              id={`${basicHealthFieldList.isAllergies.id}-yes`}
                            />
                            <Label
                              htmlFor={`${basicHealthFieldList.isAllergies.id}-yes`}
                            >
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="false"
                              id={`${basicHealthFieldList.isAllergies.id}-no`}
                            />
                            <Label
                              htmlFor={`${basicHealthFieldList.isAllergies.id}-no`}
                            >
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.isAllergies.errors}
                        </span>
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label
                          htmlFor={basicHealthFieldList.allergyDescription.id}
                        >
                          If yes, please specify:
                        </Label>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.allergyDescription,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isAllergies === "false"}
                          onInput={transformToUppercase}
                        />
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.allergyDescription.errors}
                        </span>
                      </div>
                      <div className=" space-y-1">
                        <Label
                          htmlFor={basicHealthFieldList.allergyMedicine.id}
                        >
                          Medicine
                        </Label>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.allergyMedicine,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isAllergies === "false"}
                          onInput={transformToUppercase}
                        />
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.allergyMedicine.errors}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="xl:col-span-3">
                    <p className="text-gray-400 font-semibold">
                      Health Conditions
                    </p>
                    <div className="grid grid-cols-2 xl:grid-cols-5 col-span-2 gap-5">
                      <div className=" space-y-1">
                        <Label
                          htmlFor={basicHealthFieldList.isHealthCondition.id}
                        >
                          With Health Condition?
                        </Label>
                        <RadioGroup
                          name={basicHealthFieldList.isHealthCondition.name}
                          className="flex flex-row gap-5"
                          defaultValue={String(
                            basicHealthFieldList.isHealthCondition.value || ""
                          )}
                          onValueChange={(value) => setIsHealthCondition(value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="true"
                              id={`${basicHealthFieldList.isHealthCondition.id}-yes`}
                            />
                            <Label
                              htmlFor={`${basicHealthFieldList.isHealthCondition.id}-yes`}
                            >
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="false"
                              id={`${basicHealthFieldList.isHealthCondition.id}-no`}
                            />
                            <Label
                              htmlFor={`${basicHealthFieldList.isHealthCondition.id}-no`}
                            >
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label
                          htmlFor={
                            basicHealthFieldList.healthConditionDescription.id
                          }
                        >
                          If yes, please specify:
                        </Label>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.healthConditionDescription,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isHealthCondition === "false"}
                          onInput={transformToUppercase}
                        />
                        <span className="text-red-500 text-xs">
                          {
                            basicHealthFieldList.healthConditionDescription
                              .errors
                          }
                        </span>
                      </div>
                      <div className=" space-y-1">
                        <Label
                          htmlFor={
                            basicHealthFieldList.healthConditionMedicine.id
                          }
                        >
                          Medicine
                        </Label>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.healthConditionMedicine,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isHealthCondition === "false"}
                          onInput={transformToUppercase}
                        />
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.healthConditionMedicine.errors}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="xl:col-span-3">
                    <p className="text-gray-400 font-semibold">
                      Contact Person in Case of Emergency
                    </p>
                    <div className="grid grid-cols-2 xl:grid-cols-3 col-span-2 gap-5">
                      <div className="space-y-1">
                        <Label htmlFor={contacPersonEmergencyFieldList.name.id}>
                          Contact Person
                        </Label>
                        <Input
                          {...getInputProps(
                            contacPersonEmergencyFieldList.name,
                            {
                              type: "text",
                            }
                          )}
                          onInput={transformToUppercase}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={
                            contacPersonEmergencyFieldList.relationship.id
                          }
                        >
                          Relationship
                        </Label>
                        <Input
                          {...getInputProps(
                            contacPersonEmergencyFieldList.relationship,
                            {
                              type: "text",
                            }
                          )}
                          onInput={transformToUppercase}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={
                            contacPersonEmergencyFieldList.contactNumber.id
                          }
                        >
                          Contact Number
                        </Label>
                        <Input
                          {...getInputProps(
                            contacPersonEmergencyFieldList.contactNumber,
                            {
                              type: "text",
                            }
                          )}
                          onInput={transformToUppercase}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  );
}
