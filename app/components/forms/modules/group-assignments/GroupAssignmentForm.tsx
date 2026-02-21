import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Plus, Trash2, Users } from "lucide-react";
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

interface GroupInfo {
  id: string;
  name: string;
  description?: string | null;
  maxMembers?: number | null;
  currentMembers?: number;
}

interface Registration {
  id: string;
  name: string;
  gender: string;
  gradeLevel: string;
  classification: string;
  groupId?: string | null;
  groupName?: string | null;
  isAssigned: boolean;
  isAssignedToCurrentGroup: boolean;
}

interface MemberRow {
  rowId: string;
  memberId: string;
}

interface GroupAssignmentFormProps {
  mode: "add" | "edit";
  groupList: GroupInfo[];
  defaultGroup?: GroupInfo;
  existingMembers?: Array<{ id: string; name: string }>;
  allRegistrations: Registration[];
  redirectPath: string;
}

export function GroupAssignmentForm({
  mode,
  groupList,
  defaultGroup,
  existingMembers = [],
  allRegistrations,
  redirectPath,
}: GroupAssignmentFormProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroup?.id || "");
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(defaultGroup || null);
  const [memberRows, setMemberRows] = useState<MemberRow[]>([]);
  const [hasMemberRows, setHasMemberRows] = useState(false);

  useEffect(() => {
    if (mode === "edit" && existingMembers.length > 0) {
      setMemberRows(
        existingMembers.map((member) => ({
          rowId: crypto.randomUUID(),
          memberId: member.id,
        }))
      );
      setHasMemberRows(existingMembers.length > 0);
    }
  }, [mode, existingMembers]);

  const handleGroupChange = (oldVal: string, newVal: string) => {
    const group = groupList.find((g) => g.id === newVal);
    setSelectedGroupId(newVal);
    setSelectedGroup(group || null);
  };

  const handleAddRow = () => {
    setMemberRows([...memberRows, { rowId: crypto.randomUUID(), memberId: "" }]);
    setHasMemberRows(true);
  };

  const handleRemoveRow = (rowId: string) => {
    const newRows = memberRows.filter((row) => row.rowId !== rowId);
    setMemberRows(newRows);
    setHasMemberRows(newRows.length > 0);
  };

  const handleMemberChange = (rowId: string, memberId: string) => {
    setMemberRows(
      memberRows.map((row) =>
        row.rowId === rowId ? { ...row, memberId } : row
      )
    );
  };

  const getMemberDetails = (memberId: string) => {
    return allRegistrations.find((reg) => reg.id === memberId);
  };

  const memberOptions = allRegistrations.map((reg) => ({
    id: reg.id,
    name: reg.isAssignedToCurrentGroup
      ? `${reg.name} (Already in this group)`
      : reg.isAssigned
      ? `${reg.name} (Assigned to: ${reg.groupName})`
      : reg.name,
    disabled: reg.isAssigned && !reg.isAssignedToCurrentGroup,
  }));

  const isEdit = mode === "edit";
  const title = isEdit ? "EDIT GROUP ASSIGNMENT" : "ADD GROUP ASSIGNMENT";

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
            <SaveButton formId="group-assignment-form" />
            <DeleteConfirmationDialog
              redirectPath={redirectPath}
              title="Delete Group Assignment"
              description="Are you sure you want to delete this group assignment?"
            />
          </div>
        </div>

        <Form
          id="group-assignment-form"
          className="space-y-5 w-full"
          method="post"
        >
          <input type="hidden" name="groupId" value={selectedGroupId} />
          <input type="hidden" name="hasMemberRows" value={hasMemberRows.toString()} />

          <Card className="px-5 flex flex-col w-full">
            <CardContent className="px-0 pt-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div>
                  <div className="space-y-1">
                    <LabelNoGapRequired htmlFor="groupId">Group Name</LabelNoGapRequired>
                    {isEdit ? (
                      <Input value={selectedGroup?.name || ""} disabled />
                    ) : (
                      <SelectBoxWithSearch
                        id="groupId-display"
                        name="groupId-display"
                        options={groupList.map((g) => ({
                          id: g.id,
                          name: g.name,
                        }))}
                        defaultValue={selectedGroupId}
                        onSelectValue={handleGroupChange}
                        placeholder="Select a group..."
                      />
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
                    <Label htmlFor="maxMembers">Maximum Members</Label>
                    <Input
                      value={selectedGroup?.maxMembers || ""}
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
                  {memberRows.map((row) => {
                    const selectedMember = getMemberDetails(row.memberId);
                    return (
                      <div
                        key={row.rowId}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <SelectBoxWithSearch
                              id={`member-${row.rowId}`}
                              name={`memberId-${row.rowId}`}
                              options={memberOptions}
                              defaultValue={row.memberId}
                              onSelectValue={(oldVal, newVal) =>
                                handleMemberChange(row.rowId, newVal)
                              }
                              placeholder="Select member..."
                            />
                            <input
                              type="hidden"
                              name="memberIds"
                              value={row.memberId}
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">
                              {selectedMember?.gender || "-"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">
                              {selectedMember?.gradeLevel || "-"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">
                              {selectedMember?.classification || "-"}
                            </span>
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
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  );
}
