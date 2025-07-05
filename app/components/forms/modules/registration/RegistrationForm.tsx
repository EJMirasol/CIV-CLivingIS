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
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format, parseISO } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import { Textarea } from "~/components/ui/textarea";
import { useRef, useState } from "react";
import { ImageUploader } from "~/components/shared/imageUpload/ImageUploader";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

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
      console.log("image cropped");
    };
    reader.readAsDataURL(blob);
  };

  const handleImageRemoved = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const basicHealthField = fields.basicHealthInformation || {};
  const basicHealthFieldList = basicHealthField.getFieldset();

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

  return (
    <div className="bg-gray-50">
      <div className="w-full flex flex-col px-10 lg:px-25 pb-10">
        {/* header of the Application Form */}
        <div className="ml-4 py-5 flex justify-between flex-row items-center">
          <div className="flex items-center">
            <div className="rounded-md">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-[#15313F] font-[500]">
              YOUNG PEOPLE CHURCH LIVING REGISTRATION FORM
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SaveButton formId={form.id} />
            <Link to="/">
              <Button
                className="h-8 gap-1 bg-[var(--app-secondary)]"
                type="button"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
        <Form
          className="space-y-5 w-full"
          method="post"
          {...getFormProps(form)}
        >
          <Card className="py-10 px-5 flex flex-col w-full">
            {/* for application header */}
            <div className="text-xs h-full">
              <p>
                Please fill out all the required fields marked with{" "}
                <span className="text-red-500">*</span>, and leave optional
                fields blank if not applicable "N/A".
              </p>
            </div>

            <CardContent className="px-0 pt-36 xl:pt-0">
              {/* Main form content */}
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
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={fields.suffix.id}>Suffix</Label>
                    <Input
                      className="max-w-full xl:max-w-[100px] 2xl:max-w-[130px]"
                      {...getInputProps(fields.suffix, { type: "text" })}
                      maxLength={20}
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
                    {fields.image?.errors && (
                      <span className="text-red-500 text-center text-xs block mt-1">
                        {fields.image.errors}
                      </span>
                    )}
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
                      <Label htmlFor={fields.gradeLevel.id}>Grade Level</Label>
                      <SelectBoxWithSearch
                        {...getInputProps(fields.gradeLevel, { type: "text" })}
                        options={gradeLevelList.map((opt) => ({
                          id: opt.value,
                          name: opt.label,
                        }))}
                        error={fields.gradeLevel.errors ? true : false}
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
                      <LabelNoGapRequired htmlFor={fields.dateOfBirth.id}>
                        Date of Birth
                      </LabelNoGapRequired>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start pl-3 text-left"
                          >
                            {fields.dateOfBirth.value
                              ? format(
                                  parseISO(fields.dateOfBirth.value),
                                  "MMMM d, yyyy"
                                )
                              : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0 w-auto">
                          <Calendar
                            mode="single"
                            selected={
                              fields.dateOfBirth.value
                                ? parseISO(fields.dateOfBirth.value)
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                form.update({
                                  name: "dateOfBirth",
                                  value: format(date, "yyyy-MM-dd"),
                                });
                              }
                            }}
                            disabled={() => false}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <input
                        type="hidden"
                        name="paymentDueDate"
                        value={fields.dateOfBirth.value || ""}
                      />
                      <span className="text-red-500 text-xs">
                        {fields.dateOfBirth.errors}
                      </span>
                    </div>
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
                        placeholder="Enter age"
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

                  <div className="space-y-1">
                    <LabelNoGapRequired htmlFor={fields.contactPerson.id}>
                      Contact Person
                    </LabelNoGapRequired>
                    <Input
                      {...getInputProps(fields.contactPerson, { type: "text" })}
                    />
                    <span className="text-red-500 text-xs">
                      {fields.contactPerson.errors}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <LabelNoGapRequired htmlFor={fields.contactRelationship.id}>
                      Relationship
                    </LabelNoGapRequired>
                    <Input
                      {...getInputProps(fields.contactRelationship, {
                        type: "text",
                      })}
                    />
                    <span className="text-red-500 text-xs">
                      {fields.contactRelationship.errors}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <LabelNoGapRequired htmlFor={fields.contactNumber.id}>
                      Contact Number
                    </LabelNoGapRequired>
                    <Input
                      {...getInputProps(fields.contactNumber, { type: "text" })}
                    />
                    <span className="text-red-500 text-xs">
                      {fields.contactNumber.errors}
                    </span>
                  </div>
                  <div className="xl:col-span-3">
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor="remarks">
                        Remarks
                      </LabelNoGapRequired>
                      <Textarea
                        className="resize-none"
                        {...getTextareaProps(fields.remarks)}
                        maxLength={50}
                        placeholder="Type your remarks here."
                        id="remarks"
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
                        <LabelNoGapRequired
                          htmlFor={basicHealthFieldList.isAllergies.id}
                        >
                          With Allergy
                        </LabelNoGapRequired>
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
                      </div>
                      <div className=" space-y-1">
                        <LabelNoGapRequired
                          htmlFor={basicHealthFieldList.allergyDescription.id}
                        >
                          If yes, please specify:
                        </LabelNoGapRequired>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.allergyDescription,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isAllergies === "false"}
                        />
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.allergyDescription.errors}
                        </span>
                      </div>
                      <div className=" space-y-1">
                        <LabelNoGapRequired
                          htmlFor={basicHealthFieldList.allergyMedicine.id}
                        >
                          Medicine
                        </LabelNoGapRequired>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.allergyMedicine,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isAllergies === "false"}
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
                        <LabelNoGapRequired
                          htmlFor={basicHealthFieldList.isHealthCondition.id}
                        >
                          With Health Condition?
                        </LabelNoGapRequired>
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
                      <div className=" space-y-1">
                        <LabelNoGapRequired
                          htmlFor={
                            basicHealthFieldList.healthConditionDescription.id
                          }
                        >
                          If yes, please specify:
                        </LabelNoGapRequired>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.healthConditionDescription,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isHealthCondition === "false"}
                        />
                        <span className="text-red-500 text-xs">
                          {
                            basicHealthFieldList.healthConditionDescription
                              .errors
                          }
                        </span>
                      </div>
                      <div className=" space-y-1">
                        <LabelNoGapRequired
                          htmlFor={
                            basicHealthFieldList.healthConditionMedicine.id
                          }
                        >
                          Medicine
                        </LabelNoGapRequired>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.healthConditionMedicine,
                            {
                              type: "text",
                            }
                          )}
                          disabled={isHealthCondition === "false"}
                        />
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.healthConditionMedicine.errors}
                        </span>
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
