import { redirect } from "react-router";
import { GroupAssignmentForm } from "~/components/forms/modules/group-assignments/GroupAssignmentForm";
import {
  getGroupsForDropdown,
  getAllRegistrationsWithGroupStatus,
  getAllSsotRegistrationsWithGroupStatus,
  assignToGroup,
  assignSsotToGroup,
  activateGroupForAssignment,
  getMemberTypeOptions,
} from "~/lib/server/groups.server";
import { getAllGradeLevels, getAllGenders } from "~/lib/server/registration.server";
import { getSsotGradeLevels, getSsotGenders } from "~/lib/server/ssot-registration.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import { parseWithZod } from "@conform-to/zod";
import { GroupAssignmentFormSchema } from "~/types/group.dto";
import type { Route } from "./+types/add";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const [groupList, allRegistrations, allSsotRegistrations, gradeLevelList, ssotGradeLevelList, genderList, ssotGenderList, memberTypeList] = await Promise.all([
    getGroupsForDropdown(),
    getAllRegistrationsWithGroupStatus(),
    getAllSsotRegistrationsWithGroupStatus(),
    getAllGradeLevels(),
    getSsotGradeLevels(),
    getAllGenders(),
    getSsotGenders(),
    getMemberTypeOptions(),
  ]);

  return { groupList, allRegistrations, allSsotRegistrations, gradeLevelList, ssotGradeLevelList, genderList, ssotGenderList, memberTypeList };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: GroupAssignmentFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { groupId, conferenceType, memberTypeIds, gradeLevelIds, genderIds, memberIds } = submission.value;
  const isSsot = conferenceType === "CAMANAVA_SSOT";

  if (!groupId) {
    return submission.reply({ formErrors: ["Please select a group."] });
  }

  const hasValidMembers = memberIds.some((id) => id.trim() !== "");

  if (!hasValidMembers) {
    return submission.reply({ formErrors: ["Please add at least one member."] });
  }

  try {
    await activateGroupForAssignment(groupId);

    const errors: string[] = [];

    for (let i = 0; i < memberIds.length; i++) {
      const memberId = memberIds[i];
      if (memberId.trim() === "") continue;
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
      memberIds.filter((id) => id.trim() !== "").length > 0
        ? `Successfully assigned ${memberIds.filter((id) => id.trim() !== "").length} member(s) to group.`
        : "Group assignment created successfully."
    );
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to create group assignment."],
    });
  }
}

export default function AddGroupAssignment({ loaderData }: Route.ComponentProps) {
  return (
    <GroupAssignmentForm
      mode="add"
      groupList={loaderData.groupList}
      allRegistrations={loaderData.allRegistrations}
      allSsotRegistrations={loaderData.allSsotRegistrations}
      gradeLevelList={loaderData.gradeLevelList}
      ssotGradeLevelList={loaderData.ssotGradeLevelList}
      genderList={loaderData.genderList}
      ssotGenderList={loaderData.ssotGenderList}
      memberTypeList={loaderData.memberTypeList}
      redirectPath="/conference-meetings/group-assignments"
    />
  );
}
