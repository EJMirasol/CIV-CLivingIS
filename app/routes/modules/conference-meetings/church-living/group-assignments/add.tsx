import { redirect } from "react-router";
import { GroupAssignmentForm } from "~/components/forms/modules/group-assignments/GroupAssignmentForm";
import {
  getGroupsForDropdown,
  getAllRegistrationsWithGroupStatus,
  assignToGroup,
  activateGroupForAssignment,
} from "~/lib/server/groups.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import type { Route } from "./+types/add";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const [groupList, allRegistrations] = await Promise.all([
    getGroupsForDropdown(),
    getAllRegistrationsWithGroupStatus(),
  ]);

  return { groupList, allRegistrations };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const groupId = formData.get("groupId")?.toString();
  const memberIds = formData.getAll("memberIds").filter((id) => id.toString());
  const hasMemberRows = formData.get("hasMemberRows") === "true";

  if (!groupId) {
    return { error: "Please select a group." };
  }

  const validMemberIds = memberIds.filter((id) => id.toString().trim() !== "");

  if (hasMemberRows && validMemberIds.length === 0) {
    return { error: "Please select at least one member or remove empty rows." };
  }

  try {
    await activateGroupForAssignment(groupId);

    const errors: string[] = [];

    for (const memberId of validMemberIds) {
      try {
        await assignToGroup(memberId.toString(), groupId);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        }
      }
    }

    if (errors.length > 0) {
      return { error: errors.join("; ") };
    }

    return redirectWithSuccess(
      "/conference-meetings/ypcl/group-assignments",
      validMemberIds.length > 0
        ? `Successfully assigned ${validMemberIds.length} member(s) to group.`
        : "Group assignment created successfully."
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create group assignment." };
  }
}

export default function AddGroupAssignment({ loaderData }: Route.ComponentProps) {
  return (
    <GroupAssignmentForm
      mode="add"
      groupList={loaderData.groupList}
      allRegistrations={loaderData.allRegistrations}
      redirectPath="/conference-meetings/ypcl/group-assignments"
    />
  );
}
