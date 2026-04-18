import { ClipboardList } from "lucide-react";
import { Form } from "react-router";
import {
  getFormProps,
  useForm,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react";
import { GroupFormSchema } from "~/types/group.dto";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";
import { parseWithZod } from "@conform-to/zod";
import { SaveButton } from "~/components/shared/buttons/SaveButton";
import { Card, CardContent } from "~/components/ui/card";
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { Separator } from "~/components/ui/separator";
import { DeleteConfirmationDialog } from "~/components/shared/dialogs/DeleteConfirmationDialog";

interface GroupFormProps {
  defaultValues?: {
    name?: string;
    description?: string;
    maxMembers?: number;
    conferenceType?: string;
  };
  isEdit?: boolean;
  redirectPath?: string;
}

export function GroupForm({ defaultValues, isEdit = false, redirectPath }: GroupFormProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: GroupFormSchema });
    },
    shouldValidate: "onSubmit",
    defaultValue: defaultValues || {},
  });

  const conferenceTypeOptions = FINANCE_CONFERENCE_TYPE_OPTIONS.map((opt) => ({
    id: opt.value,
    name: opt.label,
  }));

  return (
    <div className="bg-gray-50">
      <div className="w-full flex flex-col">
        <div className="ml-4 py-5 flex justify-between flex-row items-center">
          <div className="flex items-center">
            <div className="rounded-md">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-[#15313F] font-[500]">
              {isEdit ? "EDIT GROUP" : "ADD GROUP"}
            </span>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <BackButton />
          </div>
          <div className="flex items-center gap-2">
            <SaveButton formId={form.id} />
            {redirectPath && (
              <DeleteConfirmationDialog
                redirectPath={redirectPath}
                title="Delete Group"
                description="Are you sure you want to delete this group?"
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

            <CardContent className="px-0 pt-6">
              <div className="mt-5">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.name.id}>
                        Group Name
                      </LabelNoGapRequired>
                      <Input
                        {...getInputProps(fields.name, { type: "text" })}
                        maxLength={100}
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.name.errors}
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
                        error={!!fields.conferenceType.errors}
                        placeholder="Select conference type"
                      />
                      {fields.conferenceType.errors && (
                        <div className="text-red-500 text-xs mt-[1px]">
                          {fields.conferenceType.errors.map((e) => e === "Required" ? "This field is required." : e)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor={fields.maxMembers.id}>
                        Maximum Members
                      </LabelNoGapRequired>
                      <Input
                        {...getInputProps(fields.maxMembers, { type: "number" })}
                        min="1"
                        max="1000"
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.maxMembers.errors}
                    </span>
                  </div>

                  <div className="xl:col-span-3">
                    <div className="space-y-1">
                      <Label htmlFor={fields.description.id}>Description</Label>
                      <Textarea
                        className="resize-none"
                        {...getTextareaProps(fields.description)}
                        maxLength={500}
                        placeholder="Enter group description (optional)"
                        rows={4}
                      />
                    </div>
                    <span className="text-red-500 text-xs">
                      {fields.description.errors}
                    </span>
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
