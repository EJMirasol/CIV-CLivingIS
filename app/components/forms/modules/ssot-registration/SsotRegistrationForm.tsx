import { ClipboardList} from "lucide-react";
import { Form } from "react-router";
import {
  getFormProps,
  useForm,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react";
import { SsotRegistrationFormSchema } from "~/types/ssot-registration.dto";
import { parseWithZod } from "@conform-to/zod";
import { SubmitButton } from "~/components/shared/buttons/SubmitButton";
import { SaveButton } from "~/components/shared/buttons/SaveButton";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { DeleteConfirmationDialog } from "~/components/shared/dialogs/DeleteConfirmationDialog";
import { Card, CardContent } from "~/components/ui/card";
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

interface SsotRegistrationFormProps {
  gradeLevelList: { value: string; label: string }[];
  localityList: { value: string; label: string }[];
  genderList: { value: string; label: string }[];
  defaultValues?: {
    lastName?: string;
    firstName?: string;
    middleName?: string;
    suffix?: string;
    locality?: string;
    gender?: string;
    gradeLevel?: string;
    remarks?: string;
    basicHealthInformation?: {
      isAllergies?: boolean | string;
      allergyDescription?: string;
      allergyMedicine?: string;
      isHealthCondition?: boolean | string;
      healthConditionDescription?: string;
      healthConditionMedicine?: string;
    };
  };
  isPublic?: boolean;
  isEdit?: boolean;
  redirectPath?: string;
}

export function SsotRegistrationForm({
  gradeLevelList,
  localityList,
  genderList,
  defaultValues,
  isPublic = false,
  isEdit = false,
  redirectPath,
}: SsotRegistrationFormProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SsotRegistrationFormSchema });
    },
    shouldValidate: "onSubmit",
    defaultValue: {
      lastName: defaultValues?.lastName?.toUpperCase() || "",
      firstName: defaultValues?.firstName?.toUpperCase() || "",
      middleName: defaultValues?.middleName?.toUpperCase() || "",
      suffix: defaultValues?.suffix?.toUpperCase() || "",
      locality: defaultValues?.locality || "",
      gender: defaultValues?.gender || "",
      gradeLevel: defaultValues?.gradeLevel || "",
      remarks: defaultValues?.remarks?.toUpperCase() || "",
      basicHealthInformation: defaultValues?.basicHealthInformation
        ? {
            isAllergies: defaultValues.basicHealthInformation.isAllergies,
            allergyDescription: defaultValues.basicHealthInformation.allergyDescription?.toUpperCase() || "",
            allergyMedicine: defaultValues.basicHealthInformation.allergyMedicine?.toUpperCase() || "",
            isHealthCondition: defaultValues.basicHealthInformation.isHealthCondition,
            healthConditionDescription: defaultValues.basicHealthInformation.healthConditionDescription?.toUpperCase() || "",
            healthConditionMedicine: defaultValues.basicHealthInformation.healthConditionMedicine?.toUpperCase() || "",
          }
        : undefined,
    },
  });

  const basicHealthField = fields.basicHealthInformation || {};
  const basicHealthFieldList = basicHealthField.getFieldset();

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

  const transformToUppercase = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
  };

  if (isPublic) {
    return (
      <div className="bg-white">
        <div className="w-full flex flex-col">
          <Form
            className="space-y-5 w-full"
            method="post"
            {...getFormProps(form)}
          >
            <Card className="px-5 flex flex-col w-full">
              <div className="px-4 py-3 sm:py-5 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="text-[#15313F] font-[600] text-sm sm:text-base">
                    CAMANAVA SSOT 2026 REGISTRATION
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Date: May 5-10, 2026 &middot; Venue: CAMANAVA Lot Amadeo
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DeleteConfirmationDialog redirectPath="/ssot-registration" fullReload />
                  <SubmitButton formId={form.id} />
                </div>
              </div>
              <Separator />
              <div className="text-xs h-full px-4 pt-4">
                <p>
                  Please fill out all the required fields marked with{" "}
                  <span className="text-red-500">*</span>, and leave optional
                  fields blank.
                </p>
              </div>

              <CardContent className="px-0 pt-4 sm:pt-6">
                <div className="mt-5">
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
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
                        className="max-w-full xl:max-w-[100px]"
                        {...getInputProps(fields.suffix, { type: "text" })}
                        maxLength={20}
                        onInput={transformToUppercase}
                      />
                    </div>
                  </div>

                  <div className="grid xl:grid-cols-3 gap-5 mt-5">
                    <div>
                      <div className="space-y-1">
                        <LabelNoGapRequired htmlFor={fields.locality.id}>
                          Locality
                        </LabelNoGapRequired>
                        <SelectBoxWithSearch
                          {...getInputProps(fields.locality, { type: "text" })}
                          error={fields.locality.errors ? true : false}
                          options={localityList.map((opt) => ({
                            id: opt.value,
                            name: opt.label,
                          }))}
                        />
                        {fields.locality.errors && (
                          <div className="text-red-500 text-xs mt-[1px]">
                            {fields.locality.errors}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
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
                          Incoming Grade Level
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

                    <div className="xl:col-span-3">
                      <div className="space-y-1">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                          className="resize-none"
                          {...getTextareaProps(fields.remarks)}
                          maxLength={200}
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

                    <div className="xl:col-span-3">
                      <div className="text-base text-[#181919] font-semibold mb-2">
                        Basic Health Information
                        <p className="text-gray-400 font-semibold mt-2">
                          Allergies
                        </p>
                      </div>
                      <div className="grid grid-cols-2 xl:grid-cols-5 col-span-2 gap-5">
                        <div className="space-y-1">
                          <Label htmlFor={basicHealthFieldList.isAllergies.id}>
                            With Allergy?
                          </Label>
                          <RadioGroup
                            name={basicHealthFieldList.isAllergies.name}
                            className="flex flex-row gap-5"
                            defaultValue={String(
                              basicHealthFieldList.isAllergies.value ?? ""
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
                        <div className="col-span-3 space-y-1">
                          <Label
                            htmlFor={basicHealthFieldList.allergyDescription.id}
                          >
                            If yes, please specify:
                          </Label>
                          <Input
                            {...getInputProps(
                              basicHealthFieldList.allergyDescription,
                              { type: "text" }
                            )}
                            disabled={isAllergies !== "true"}
                            onInput={transformToUppercase}
                          />
                          <span className="text-red-500 text-xs">
                            {basicHealthFieldList.allergyDescription.errors}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={basicHealthFieldList.allergyMedicine.id}>
                            Medicine
                          </Label>
                          <Input
                            {...getInputProps(
                              basicHealthFieldList.allergyMedicine,
                              { type: "text" }
                            )}
                            disabled={isAllergies !== "true"}
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
                        <div className="space-y-1">
                          <Label
                            htmlFor={basicHealthFieldList.isHealthCondition.id}
                          >
                            With Health Condition?
                          </Label>
                          <RadioGroup
                            name={basicHealthFieldList.isHealthCondition.name}
                            className="flex flex-row gap-5"
                            defaultValue={String(
                              basicHealthFieldList.isHealthCondition.value ?? ""
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
                              { type: "text" }
                            )}
                            disabled={isHealthCondition !== "true"}
                            onInput={transformToUppercase}
                          />
                          <span className="text-red-500 text-xs">
                            {basicHealthFieldList.healthConditionDescription.errors}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={basicHealthFieldList.healthConditionMedicine.id}
                          >
                            Medicine
                          </Label>
                          <Input
                            {...getInputProps(
                              basicHealthFieldList.healthConditionMedicine,
                              { type: "text" }
                            )}
                            disabled={isHealthCondition !== "true"}
                            onInput={transformToUppercase}
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

  return (
    <div className="bg-gray-50">
      <div className="w-full flex flex-col">
        <div className="px-4 py-3 sm:py-5 flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <div className="rounded-md">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-[#15313F] font-[500] text-sm sm:text-base">
              {isEdit ? "EDIT SSOT REGISTRATION" : "CAMANAVA SSOT REGISTRATION"}
            </span>
            <Separator orientation="vertical" className="hidden sm:block mx-2 h-6" />
            <BackButton />
          </div>
          <div className="flex items-center gap-2">
            <SaveButton formId={form.id} />
            {redirectPath && (
              <DeleteConfirmationDialog
                redirectPath={redirectPath}
                title="Delete Registration"
                description="Are you sure you want to delete this registration?"
              />
            )}
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

            <CardContent className="px-0 pt-4 sm:pt-6">
              <div className="mt-5">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
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
                      className="max-w-full xl:max-w-[100px]"
                      {...getInputProps(fields.suffix, { type: "text" })}
                      maxLength={20}
                      onInput={transformToUppercase}
                    />
                  </div>
                </div>

                <div className="grid xl:grid-cols-3 gap-5 mt-5">
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.locality.id}>
                        Locality
                      </LabelNoGapRequired>
                      <SelectBoxWithSearch
                        {...getInputProps(fields.locality, { type: "text" })}
                        error={fields.locality.errors ? true : false}
                        options={localityList.map((opt) => ({
                          id: opt.value,
                          name: opt.label,
                        }))}
                      />
                      {fields.locality.errors && (
                        <div className="text-red-500 text-xs mt-[1px]">
                          {fields.locality.errors}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
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
                        Incoming Grade Level
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

                  <div className="xl:col-span-3">
                    <div className="space-y-1">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        className="resize-none"
                        {...getTextareaProps(fields.remarks)}
                        maxLength={200}
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

                  <div className="xl:col-span-3">
                    <div className="text-base text-[#181919] font-semibold mb-2">
                      Basic Health Information
                      <p className="text-gray-400 font-semibold mt-2">
                        Allergies
                      </p>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-5 col-span-2 gap-5">
                      <div className="space-y-1">
                        <Label htmlFor={basicHealthFieldList.isAllergies.id}>
                          With Allergy?
                        </Label>
                        <RadioGroup
                          name={basicHealthFieldList.isAllergies.name}
                          className="flex flex-row gap-5"
                          defaultValue={String(
                            basicHealthFieldList.isAllergies.value ?? ""
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
                      <div className="col-span-3 space-y-1">
                        <Label
                          htmlFor={basicHealthFieldList.allergyDescription.id}
                        >
                          If yes, please specify:
                        </Label>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.allergyDescription,
                            { type: "text" }
                          )}
                          disabled={isAllergies !== "true"}
                          onInput={transformToUppercase}
                        />
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.allergyDescription.errors}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={basicHealthFieldList.allergyMedicine.id}>
                          Medicine
                        </Label>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.allergyMedicine,
                            { type: "text" }
                          )}
                          disabled={isAllergies !== "true"}
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
                      <div className="space-y-1">
                        <Label
                          htmlFor={basicHealthFieldList.isHealthCondition.id}
                        >
                          With Health Condition?
                        </Label>
                        <RadioGroup
                          name={basicHealthFieldList.isHealthCondition.name}
                          className="flex flex-row gap-5"
                          defaultValue={String(
                            basicHealthFieldList.isHealthCondition.value ?? ""
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
                            { type: "text" }
                          )}
                          disabled={isHealthCondition !== "true"}
                          onInput={transformToUppercase}
                        />
                        <span className="text-red-500 text-xs">
                          {basicHealthFieldList.healthConditionDescription.errors}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={basicHealthFieldList.healthConditionMedicine.id}
                        >
                          Medicine
                        </Label>
                        <Input
                          {...getInputProps(
                            basicHealthFieldList.healthConditionMedicine,
                            { type: "text" }
                          )}
                          disabled={isHealthCondition !== "true"}
                          onInput={transformToUppercase}
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
