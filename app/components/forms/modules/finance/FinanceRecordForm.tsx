import { DollarSign } from "lucide-react";
import { Form } from "react-router";
import {
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { FinanceRecordFormSchema } from "~/types/finance-record.dto";
import { parseWithZod } from "@conform-to/zod";
import { SaveButton } from "~/components/shared/buttons/SaveButton";
import { Card, CardContent } from "~/components/ui/card";
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { Separator } from "~/components/ui/separator";
import { DeleteConfirmationDialog } from "~/components/shared/dialogs/DeleteConfirmationDialog";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";
import { useFetcher } from "react-router";
import { useState, useEffect } from "react";

interface FinanceRecordFormProps {
  billingSettings: Array<{
    label: string;
    value: string;
    feeType: string;
    amount: number;
  }>;
  localityList: Array<{
    label: string;
    value: string;
  }>;
  redirectPath?: string;
}

export function FinanceRecordForm({ billingSettings, localityList, redirectPath = "/finance/registration" }: FinanceRecordFormProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      const ct = formData.get("conferenceType") as string;
      const loc = formData.get("locality") as string;
      const regId = formData.get("registrationId") as string;
      const ssotRegId = formData.get("ssotRegistrationId") as string;

      if (ct === "CAMANAVA_SSOT" && !loc) {
        setLocalityError("This field is required.");
      } else {
        setLocalityError("");
      }

      if (ct === "CAMANAVA_SSOT") {
        setRegistrantError(loc && !ssotRegId ? "This field is required." : "");
      } else if (ct === "YP_CHURCH_LIVING") {
        setRegistrantError(!regId ? "This field is required." : "");
      } else {
        setRegistrantError("");
      }

      return parseWithZod(formData, { schema: FinanceRecordFormSchema });
    },
    shouldValidate: "onSubmit",
  });

  const fetcher = useFetcher();
  const [selectedConferenceType, setSelectedConferenceType] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [localityError, setLocalityError] = useState("");
  const [registrantError, setRegistrantError] = useState("");

  const isSsot = selectedConferenceType === "CAMANAVA_SSOT";

  const handleConferenceTypeChange = (_: string, val: string) => {
    setSelectedConferenceType(val === selectedConferenceType ? "" : val);
    setSelectedLocality("");
    setLocalityError("");
    setRegistrantError("");
  };

  const handleLocalityChange = (_: string, val: string) => {
    setSelectedLocality(val);
    setLocalityError("");
    setRegistrantError("");
  };

  useEffect(() => {
    if (selectedConferenceType) {
      const params = new URLSearchParams({ conferenceType: selectedConferenceType });
      if (isSsot && selectedLocality) {
        params.set("locality", selectedLocality);
      }
      fetcher.load(`/finance/registrants?${params.toString()}`);
    }
  }, [selectedConferenceType, selectedLocality]);

  const registrantOptions = fetcher.data?.data
    ? fetcher.data.data.map((r: any) => ({
        id: r.id,
        name: r.name,
      }))
    : [];

  const filteredBillingSettings = selectedConferenceType
    ? billingSettings.filter((s) => {
        const settingType = s.feeType.toLowerCase();
        if (selectedConferenceType === "CAMANAVA_SSOT") {
          return settingType.includes("ssot") || settingType.includes("camanava");
        }
        return settingType.includes("church living") || settingType.includes("yp");
      })
    : billingSettings;

  const billingSettingOptions = filteredBillingSettings.map((s) => ({
    id: s.value,
    name: s.label,
  }));

  const conferenceTypeOptions = FINANCE_CONFERENCE_TYPE_OPTIONS.map((o) => ({
    id: o.value,
    name: o.label,
  }));

  const localityOptions = localityList.map(({ label, value }) => ({
    id: value,
    name: label,
  }));

  return (
    <div className="bg-gray-50">
      <div className="w-full flex flex-col">
        <div className="ml-4 py-5 flex justify-between flex-row items-center">
          <div className="flex items-center">
            <div className="rounded-md">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[#15313F] font-[500]">
              ADD FINANCE RECORD
            </span>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <BackButton />
          </div>
          <div className="flex items-center gap-2">
            <SaveButton formId={form.id} />
            <DeleteConfirmationDialog
              redirectPath={redirectPath}
              title="Cancel"
              description="Are you sure you want to cancel? Any changes will not be saved."
              triggerText="Cancel"
            />
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

              {form.errors && (
                <div className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                  {form.errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}

            <CardContent className="px-0 pt-6">
              <div className="mt-5">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor="conferenceType">
                        Conference Type
                      </LabelNoGapRequired>
                      <SelectBoxWithSearch
                        id="conferenceType"
                        name="conferenceType"
                        options={conferenceTypeOptions}
                        onSelectValue={handleConferenceTypeChange}
                        error={!!fields.conferenceType.errors}
                        placeholder="Select conference type"
                      />
                    </div>
                    {fields.conferenceType.errors && (
                      <div className="text-red-500 text-xs mt-[1px]">
                        {fields.conferenceType.errors.map((e) => e === "Required" ? "This field is required." : e)}
                      </div>
                    )}
                  </div>

                  {isSsot && (
                    <div>
                      <div className="space-y-1">
                        <LabelNoGapRequired htmlFor="locality">
                          Locality
                        </LabelNoGapRequired>
                        <SelectBoxWithSearch
                          id="locality"
                          name="locality"
                          options={localityOptions}
                          onSelectValue={handleLocalityChange}
                          error={!!localityError}
                          placeholder="Select locality"
                        />
                      </div>
                      {localityError && (
                        <div className="text-red-500 text-xs mt-[1px]">
                          {localityError}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor="registrantId">
                        Registrant
                      </LabelNoGapRequired>
                      <SelectBoxWithSearch
                        key={`registrant-${selectedConferenceType}-${selectedLocality}`}
                        id="registrantId"
                        name={selectedConferenceType === "CAMANAVA_SSOT" ? "ssotRegistrationId" : "registrationId"}
                        options={registrantOptions}
                        disabled={!selectedConferenceType || (isSsot && !selectedLocality)}
                        error={!!registrantError}
                        placeholder={
                          !selectedConferenceType
                            ? "Select conference type first"
                            : isSsot && !selectedLocality
                              ? "Select locality first"
                              : "Select registrant"
                        }
                      />
                    </div>
                    {registrantError && (
                      <div className="text-red-500 text-xs mt-[1px]">
                        {registrantError}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor="billingSettingId">
                        Fee Type
                      </LabelNoGapRequired>
                      <SelectBoxWithSearch
                        key={`billing-${selectedConferenceType}`}
                        id="billingSettingId"
                        name="billingSettingId"
                        options={billingSettingOptions}
                        disabled={!selectedConferenceType}
                        error={!!fields.billingSettingId.errors}
                        placeholder={selectedConferenceType ? "Select fee type" : "Select conference type first"}
                      />
                    </div>
                    {fields.billingSettingId.errors && (
                      <div className="text-red-500 text-xs mt-[1px]">
                        {fields.billingSettingId.errors.map((e) => e === "Required" ? "This field is required." : e)}
                      </div>
                    )}
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
