import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Plus, Trash2, Users } from "lucide-react";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { SaveButton } from "~/components/shared/buttons/SaveButton";
import { DeleteConfirmationDialog } from "~/components/shared/dialogs/DeleteConfirmationDialog";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { LabelNoGapRequired } from "~/components/labels/LabelNoGap";
import { FINANCE_CONFERENCE_TYPE_OPTIONS } from "~/types/finance-record.dto";
import { GroupAssignmentFormSchema } from "~/types/group.dto";

interface GroupInfo {
  id: string;
  name: string;
  description?: string | null;
  maxMembers?: number | null;
  currentMembers?: number;
  conferenceType?: string;
}

interface Registration {
  id: string;
  name: string;
  gender: string;
  gradeLevel: string;
  gradeLevelId: string;
  classification: string | null;
  groupId?: string | null;
  groupName?: string | null;
  isAssigned: boolean;
  isAssignedToCurrentGroup: boolean;
}

interface MemberRow {
  rowId: string;
  memberId: string;
  memberTypeId: string;
  gradeLevelId: string;
  genderId: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface GroupAssignmentFormProps {
  mode: "add" | "edit";
  groupList: GroupInfo[];
  defaultGroup?: GroupInfo;
  existingMembers?: Array<{ id: string; name: string; memberType?: string | null }>;
  allRegistrations: Registration[];
  allSsotRegistrations?: Registration[];
  gradeLevelList: DropdownOption[];
  ssotGradeLevelList: DropdownOption[];
  genderList: DropdownOption[];
  ssotGenderList: DropdownOption[];
  memberTypeList: DropdownOption[];
  redirectPath: string;
}

export function GroupAssignmentForm({
  mode,
  groupList,
  defaultGroup,
  existingMembers = [],
  allRegistrations,
  allSsotRegistrations = [],
  gradeLevelList,
  ssotGradeLevelList,
  genderList,
  ssotGenderList,
  memberTypeList,
  redirectPath,
}: GroupAssignmentFormProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroup?.id || "");
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(defaultGroup || null);
  const [selectedConferenceType, setSelectedConferenceType] = useState<string>(defaultGroup?.conferenceType || "");
  const [memberRows, setMemberRows] = useState<MemberRow[]>([]);
  const [hasMemberRows, setHasMemberRows] = useState(false);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: GroupAssignmentFormSchema });
    },
    shouldValidate: "onSubmit",
  });

  const formatConferenceType = (type: string) => {
    const typeMap: Record<string, string> = {
      YP_CHURCH_LIVING: "YP Church Living",
      CAMANAVA_SSOT: "CAMANAVA SSOT",
    };
    return typeMap[type] || type;
  };

  const isSsot = selectedConferenceType === "CAMANAVA_SSOT";
  const activeRegistrations = isSsot ? allSsotRegistrations : allRegistrations;
  const activeGradeLevelList = isSsot ? ssotGradeLevelList : gradeLevelList;
  const activeGenderList = isSsot ? ssotGenderList : genderList;

  const gradeLevelOptions = activeGradeLevelList.map((opt) => ({
    id: opt.value,
    name: opt.label,
  }));

  const genderOptions = activeGenderList.map((opt) => ({
    id: opt.value,
    name: opt.label,
  }));

  const memberTypeOptions = memberTypeList.map((opt) => ({
    id: opt.value,
    name: opt.label,
  }));

  const getMemberOptionsForRow = (row: MemberRow) => {
    let filtered = activeRegistrations;

    if (row.gradeLevelId) {
      const gradeLevelName = activeGradeLevelList.find((gl) => gl.value === row.gradeLevelId)?.label || "";
      filtered = filtered.filter((reg) => reg.gradeLevel === gradeLevelName);
    }

    if (row.genderId) {
      const genderLabel = activeGenderList.find((g) => g.value === row.genderId)?.label || "";
      filtered = filtered.filter((reg) => reg.gender === genderLabel);
    }

    return filtered.map((reg) => ({
      id: reg.id,
      name: reg.isAssignedToCurrentGroup
        ? `${reg.name} (Already in this group)`
        : reg.isAssigned
        ? `${reg.name} (Assigned to: ${reg.groupName})`
        : reg.name,
      disabled: reg.isAssigned && !reg.isAssignedToCurrentGroup,
    }));
  };

  useEffect(() => {
    if (mode === "edit" && existingMembers.length > 0) {
      setMemberRows(
        existingMembers.map((member) => {
          const reg = activeRegistrations.find((r) => r.id === member.id);
          const gradeLevelId = reg?.gradeLevelId || "";
          const genderId = activeGenderList.find(
            (g) => g.label === reg?.gender
          )?.value || "";
          const memberTypeId = member.memberType || "";
          return {
            rowId: crypto.randomUUID(),
            memberId: member.id,
            memberTypeId,
            gradeLevelId,
            genderId,
          };
        })
      );
      setHasMemberRows(existingMembers.length > 0);
    }
  }, [mode, existingMembers]);

  const handleGroupChange = (oldVal: string, newVal: string) => {
    const group = groupList.find((g) => g.id === newVal);
    setSelectedGroupId(newVal);
    setSelectedGroup(group || null);
    if (group) {
      setSelectedConferenceType(group.conferenceType || "");
    }
    setMemberRows([]);
    setHasMemberRows(false);
  };

  const handleConferenceTypeChange = (oldVal: string, newVal: string) => {
    setSelectedConferenceType(newVal === selectedConferenceType ? "" : newVal);
    setSelectedGroupId("");
    setSelectedGroup(null);
    setMemberRows([]);
    setHasMemberRows(false);
  };

  const handleAddRow = () => {
    setMemberRows([...memberRows, { rowId: crypto.randomUUID(), memberId: "", memberTypeId: "", gradeLevelId: "", genderId: "" }]);
    setHasMemberRows(true);
  };

  const handleRemoveRow = (rowId: string) => {
    const newRows = memberRows.filter((row) => row.rowId !== rowId);
    setMemberRows(newRows);
    setHasMemberRows(newRows.length > 0);
  };

  const handleGradeLevelChange = (rowId: string, gradeLevelId: string) => {
    setMemberRows(
      memberRows.map((row) => {
        if (row.rowId !== rowId) return row;
        const newVal = gradeLevelId === row.gradeLevelId ? "" : gradeLevelId;
        return { ...row, gradeLevelId: newVal, memberId: "" };
      })
    );
  };

  const handleMemberTypeChange = (rowId: string, memberTypeId: string) => {
    setMemberRows(
      memberRows.map((row) => {
        if (row.rowId !== rowId) return row;
        const newVal = memberTypeId === row.memberTypeId ? "" : memberTypeId;
        return { ...row, memberTypeId: newVal };
      })
    );
  };

  const handleGenderChange = (rowId: string, genderId: string) => {
    setMemberRows(
      memberRows.map((row) => {
        if (row.rowId !== rowId) return row;
        const newVal = genderId === row.genderId ? "" : genderId;
        return { ...row, genderId: newVal, memberId: "" };
      })
    );
  };

  const handleMemberChange = (rowId: string, memberId: string) => {
    setMemberRows(
      memberRows.map((row) => {
        if (row.rowId !== rowId) return row;
        if (memberId === row.memberId) return { ...row, memberId: "" };
        const reg = activeRegistrations.find((r) => r.id === memberId);
        const autoGradeLevelId = reg?.gradeLevelId || "";
        const autoGenderId = activeGenderList.find(
          (g) => g.label === reg?.gender
        )?.value || "";
        return { ...row, memberId, memberTypeId: row.memberTypeId || "MEMBER", gradeLevelId: autoGradeLevelId, genderId: autoGenderId };
      })
    );
  };

  const isEdit = mode === "edit";
  const title = isEdit ? "EDIT GROUP ASSIGNMENT" : "ADD GROUP ASSIGNMENT";

  const conferenceTypeOptions = FINANCE_CONFERENCE_TYPE_OPTIONS.map((opt) => ({
    id: opt.value,
    name: opt.label,
  }));

  const filteredGroupList = selectedConferenceType
    ? groupList.filter((g) => g.conferenceType === selectedConferenceType)
    : groupList;

  return (
    <div className="bg-gray-50">
      <div className="w-full flex flex-col">
        <div className="ml-4 py-5 flex justify-between flex-row items-center">
          <div className="flex items-center">
            <div className="rounded-md">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[#15313F] font-[500]">{title}</span>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <BackButton />
          </div>
          <div className="flex items-center gap-2">
            <SaveButton formId={form.id} />
            <DeleteConfirmationDialog
              redirectPath={redirectPath}
              title="Delete Group Assignment"
              description="Are you sure you want to delete this group assignment?"
            />
          </div>
        </div>

        {form.errors && (
          <div className="mx-4 mb-2 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3">
            {form.errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        <Form
          className="space-y-5 w-full"
          method="post"
          {...getFormProps(form)}
        >
          <input type="hidden" name="groupId" value={selectedGroupId} />
          <input type="hidden" name="hasMemberRows" value={hasMemberRows.toString()} />

          <Card className="px-5 flex flex-col w-full">
            <CardContent className="px-0 pt-6">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                {isEdit ? (
                  <div>
                    <div className="space-y-1">
                      <Label>Conference Type</Label>
                      <Input value={formatConferenceType(selectedGroup?.conferenceType || "")} disabled />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-1">
                      <LabelNoGapRequired htmlFor="conferenceType">Conference Type</LabelNoGapRequired>
                      <SelectBoxWithSearch
                        id="conferenceType"
                        name="conferenceType"
                        options={conferenceTypeOptions}
                        defaultValue={selectedConferenceType}
                        onSelectValue={handleConferenceTypeChange}
                        placeholder="Select conference type..."
                        error={!!fields.conferenceType.errors}
                      />
                      {fields.conferenceType.errors && (
                        <div className="text-red-500 text-xs mt-[1px]">
                          {fields.conferenceType.errors.map((e) => e === "Required" ? "This field is required." : e)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="space-y-1">
                    <LabelNoGapRequired htmlFor="groupId">Group Name</LabelNoGapRequired>
                    {isEdit ? (
                      <Input value={selectedGroup?.name || ""} disabled />
                    ) : (
                      <>
                        <SelectBoxWithSearch
                          id="groupId-display"
                          name="groupId-display"
                          options={filteredGroupList.map((g) => ({
                            id: g.id,
                            name: g.name,
                          }))}
                          defaultValue={selectedGroupId}
                          onSelectValue={handleGroupChange}
                          placeholder="Select a group..."
                          disabled={!selectedConferenceType}
                          error={!!fields.groupId.errors && !!selectedConferenceType}
                        />
                        {fields.groupId.errors && selectedConferenceType && (
                          <div className="text-red-500 text-xs mt-[1px]">
                            {fields.groupId.errors.map((e) => e === "Required" ? "This field is required." : e)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-1">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      value={selectedGroup?.description || ""}
                      disabled
                      placeholder="Auto-filled based on group"
                    />
                  </div>
                </div>

                <div>
                  <div className="space-y-1">
                    <Label htmlFor="availableSlots">Available Slots</Label>
                    <Input
                      value={selectedGroup?.maxMembers
                        ? `${selectedGroup.maxMembers - (selectedGroup.currentMembers || 0)} of ${selectedGroup.maxMembers} slots available`
                        : ""}
                      disabled
                      placeholder="Auto-filled based on group"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({memberRows.filter((r) => r.memberId).length})
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                disabled={!selectedGroupId}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
            </CardHeader>
            <CardContent>
              {!selectedGroupId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Please select a group first to add members.</p>
                </div>
              ) : memberRows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No members added yet.</p>
                  <p className="text-sm">Click "Add Row" to add members to this group.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberRows.map((row, index) => (
                    <div
                      key={row.rowId}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <LabelNoGapRequired htmlFor={`memberTypeIds-${index}`}>Member Type</LabelNoGapRequired>
                          <SelectBoxWithSearch
                            id={`memberTypeIds-${index}`}
                            name="memberTypeIds[]"
                            options={memberTypeOptions}
                            defaultValue={row.memberTypeId}
                            onSelectValue={(oldVal, newVal) =>
                              handleMemberTypeChange(row.rowId, newVal)
                            }
                            placeholder="Select type..."
                            error={!!(fields.memberTypeIds as any)?.[index]?.errors}
                          />
                          {(fields.memberTypeIds as any)?.[index]?.errors && (
                            <div className="text-red-500 text-xs mt-[1px]">
                              {(fields.memberTypeIds as any)[index].errors.map((e: string) => e === "Required" ? "This field is required." : e)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <LabelNoGapRequired htmlFor={`gradeLevelIds-${index}`}>Incoming Grade Level</LabelNoGapRequired>
                          <SelectBoxWithSearch
                            id={`gradeLevelIds-${index}`}
                            name="gradeLevelIds[]"
                            options={gradeLevelOptions}
                            defaultValue={row.gradeLevelId}
                            onSelectValue={(oldVal, newVal) =>
                              handleGradeLevelChange(row.rowId, newVal)
                            }
                            placeholder="Select grade level..."
                            error={!!(fields.gradeLevelIds as any)?.[index]?.errors}
                          />
                          {(fields.gradeLevelIds as any)?.[index]?.errors && (
                            <div className="text-red-500 text-xs mt-[1px]">
                              {(fields.gradeLevelIds as any)[index].errors.map((e: string) => e === "Required" ? "This field is required." : e)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <LabelNoGapRequired htmlFor={`genderIds-${index}`}>Gender</LabelNoGapRequired>
                          <SelectBoxWithSearch
                            id={`genderIds-${index}`}
                            name="genderIds[]"
                            options={genderOptions}
                            defaultValue={row.genderId}
                            onSelectValue={(oldVal, newVal) =>
                              handleGenderChange(row.rowId, newVal)
                            }
                            placeholder="Select gender..."
                            error={!!(fields.genderIds as any)?.[index]?.errors}
                          />
                          {(fields.genderIds as any)?.[index]?.errors && (
                            <div className="text-red-500 text-xs mt-[1px]">
                              {(fields.genderIds as any)[index].errors.map((e: string) => e === "Required" ? "This field is required." : e)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <LabelNoGapRequired htmlFor={`memberIds-${index}`}>Name</LabelNoGapRequired>
                          <SelectBoxWithSearch
                            id={`memberIds-${index}`}
                            name="memberIds[]"
                            options={getMemberOptionsForRow(row)}
                            defaultValue={row.memberId}
                            onSelectValue={(oldVal, newVal) =>
                              handleMemberChange(row.rowId, newVal)
                            }
                            placeholder={!row.gradeLevelId || !row.genderId ? "Select grade level and gender first..." : "Select member..."}
                            error={!!(fields.memberIds as any)?.[index]?.errors}
                            disabled={!row.gradeLevelId || !row.genderId}
                          />
                          {(fields.memberIds as any)?.[index]?.errors && (
                            <div className="text-red-500 text-xs mt-[1px]">
                              {(fields.memberIds as any)[index].errors.map((e: string) => e === "Required" ? "This field is required." : e)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveRow(row.rowId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  );
}
