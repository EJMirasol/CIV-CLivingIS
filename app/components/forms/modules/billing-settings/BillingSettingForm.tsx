import { Settings } from "lucide-react";
import { Form } from "react-router";
import { getFormProps, useForm, getInputProps, getTextareaProps } from "@conform-to/react";
import { BillingSettingFormSchema } from "~/types/billing-setting.dto";
import { parseWithZod } from "@conform-to/zod";
import { SaveButton } from "~/components/shared/buttons/SaveButton";
import { Card, CardContent } from "~/components/ui/card";
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { CONFERENCE_TYPE_OPTIONS } from "~/types/billing-setting.dto";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { Separator } from "~/components/ui/separator";
import { DeleteConfirmationDialog } from "~/components/shared/dialogs/DeleteConfirmationDialog";
import { Label } from "~/components/ui/label";

interface BillingSettingFormProps {
  defaultValues?: {
    feeType?: string;
    conferenceType?: string;
    amount?: string;
    remarks?: string;
  };
  isEdit?: boolean;
  redirectPath?: string;
}

export function BillingSettingForm({
  defaultValues,
  isEdit = false,
  redirectPath,
}: BillingSettingFormProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: BillingSettingFormSchema });
    },
    shouldValidate: "onSubmit",
    defaultValue: defaultValues || {},
  });

  const conferenceTypeOptions = CONFERENCE_TYPE_OPTIONS.map((opt) => ({
    id: opt.value,
    name: opt.label,
  }));

  return (
    <div className="bg-gray-50">
      <div className="w-full flex flex-col">
        <div className="ml-4 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center">
            <div className="rounded-md">
              <Settings className="h-5 w-5" />
            </div>
            <span className="text-[#15313F] font-[500]">
              {isEdit ? "EDIT BILLING SETTING" : "ADD BILLING SETTING"}
            </span>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <BackButton />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SaveButton formId={form.id} />
            {redirectPath && (
              <DeleteConfirmationDialog
                redirectPath={redirectPath}
                title="Delete Billing Setting"
                description="Are you sure you want to delete this billing setting?"
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
                <span className="text-red-500">*</span>.
              </p>
            </div>

            <CardContent className="px-0 pt-6">
              <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.feeType.id}>
                        Fee Type
                      </LabelNoGapRequired>
                      <Input
                        {...getInputProps(fields.feeType, { type: "text" })}
                        maxLength={100}
                        placeholder="e.g., Registration Fee"
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.feeType.errors}
                    </span>
                  </div>

                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.conferenceType.id}>
                        Conference Type
                      </LabelNoGapRequired>
                      <SelectBoxWithSearch
                        {...getInputProps(fields.conferenceType, {
                          type: "text",
                        })}
                        options={conferenceTypeOptions}
                        error={fields.conferenceType.errors ? true : false}
                        placeholder="Select conference type"
                      />
                      {fields.conferenceType.errors && (
                        <div className="text-red-500 text-xs mt-[1px]">
                          {fields.conferenceType.errors}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.amount.id}>
                        Amount (PHP)
                      </LabelNoGapRequired>
                      <Input
                        {...getInputProps(fields.amount, { type: "number" })}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.amount.errors}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="space-y-1">
                    <Label htmlFor={fields.remarks.id}>Remarks</Label>
                    <Textarea
                      {...getTextareaProps(fields.remarks)}
                      placeholder="Enter remarks (optional)"
                      rows={3}
                    />
                  </div>
                  <span className="text-red-500 text-xs">
                    {fields.remarks.errors}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  );
}
