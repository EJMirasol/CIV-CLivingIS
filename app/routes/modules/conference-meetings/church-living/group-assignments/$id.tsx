import { redirect } from "react-router";
import { GroupAssignmentForm } from "~/components/forms/modules/group-assignments/GroupAssignmentForm";
import {
  getGroupById,
  getGroupsForDropdown,
  getAllRegistrationsWithGroupStatus,
  getAllSsotRegistrationsWithGroupStatus,
  assignToGroup,
  assignSsotToGroup,
  removeFromGroup,
  removeSsotFromGroup,
  getMemberTypeOptions,
} from "~/lib/server/groups.server";
import { getAllGradeLevels, getAllGenders } from "~/lib/server/registration.server";
import { getSsotGradeLevels, getSsotGenders } from "~/lib/server/ssot-registration.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { GroupAssignmentFormSchema } from "~/types/group.dto";
import type { Route } from "./+types/$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  if (!params.id) {
    throw new Response("Group ID is required", { status: 400 });
  }

  try {
    const group = await getGroupById(params.id);

    const [groupList, allRegistrations, allSsotRegistrations, gradeLevelList, ssotGradeLevelList, genderList, ssotGenderList, memberTypeList] = await Promise.all([
      getGroupsForDropdown(),
      getAllRegistrationsWithGroupStatus(params.id),
      getAllSsotRegistrationsWithGroupStatus(params.id),
      getAllGradeLevels(),
      getSsotGradeLevels(),
      getAllGenders(),
      getSsotGenders(),
      getMemberTypeOptions(),
    ]);

    return {
      group,
      groupList,
      allRegistrations,
      allSsotRegistrations,
      gradeLevelList,
      ssotGradeLevelList,
      genderList,
      ssotGenderList,
      memberTypeList,
    };
  } catch (error) {
    throw new Response(
      error instanceof Error ? error.message : "Group not found",
      { status: 404 }
    );
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  if (!params.id) {
    throw new Response("Group ID is required", { status: 400 });
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: GroupAssignmentFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { groupId, conferenceType, memberTypeIds, gradeLevelIds, genderIds, memberIds } = submission.value;
  const isSsot = conferenceType === "CAMANAVA_SSOT";
  const validMemberIds = memberIds.filter((id) => id.trim() !== "");

  try {
    const group = await getGroupById(params.id);

    if (group.maxMembers && validMemberIds.length > group.maxMembers) {
      return submission.reply({
        formErrors: ["This group has reached maximum capacity. Remove a member before adding new ones."],
      });
    }

    const existingMemberIds = group.members.map((m) => m.id);

    const membersToRemove = existingMemberIds.filter(
      (id) => !validMemberIds.includes(id)
    );

    const errors: string[] = [];

    for (const memberId of membersToRemove) {
      try {
        if (isSsot) {
          await removeSsotFromGroup(memberId);
        } else {
          await removeFromGroup(memberId);
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        }
      }
    }

    for (let i = 0; i < memberIds.length; i++) {
      const memberId = memberIds[i];
      if (memberId.trim() === "") continue;
      if (existingMemberIds.includes(memberId)) continue;
      try {
        if (isSsot) {
          await assignSsotToGroup(memberId, groupId, gradeLevelIds[i], genderIds[i], memberTypeIds[i]);
        } else {
          await assignToGroup(memberId, groupId, memberTypeIds[i]);
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        }
      }
    }

    if (errors.length > 0) {
      return submission.reply({ formErrors: errors });
    }

    return redirectWithSuccess(
      "/conference-meetings/group-assignments",
      "Group assignment updated successfully."
    );
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to update group assignment."],
    });
  }
}

export default function EditGroupAssignment({ loaderData }: Route.ComponentProps) {
  const { group, groupList, allRegistrations, allSsotRegistrations, gradeLevelList, ssotGradeLevelList, genderList, ssotGenderList, memberTypeList } = loaderData;

  return (
    <GroupAssignmentForm
      mode="edit"
      groupList={groupList}
      defaultGroup={{
        id: group.id,
        name: group.name,
        description: group.description,
        maxMembers: group.maxMembers,
        currentMembers: group.currentMembers,
        conferenceType: group.conferenceType,
      }}
      existingMembers={group.members}
      allRegistrations={allRegistrations}
      allSsotRegistrations={allSsotRegistrations}
      gradeLevelList={gradeLevelList}
      ssotGradeLevelList={ssotGradeLevelList}
      genderList={genderList}
      ssotGenderList={ssotGenderList}
      memberTypeList={memberTypeList}
      redirectPath="/conference-meetings/group-assignments"
    />
  );
}
