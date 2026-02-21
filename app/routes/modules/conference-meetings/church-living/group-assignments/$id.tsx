import { redirect } from "react-router";
import { GroupAssignmentForm } from "~/components/forms/modules/group-assignments/GroupAssignmentForm";
import {
  getGroupById,
  getGroupsForDropdown,
  getAllRegistrationsWithGroupStatus,
  assignToGroup,
  removeFromGroup,
} from "~/lib/server/groups.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
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
    const [group, groupList, allRegistrations] = await Promise.all([
      getGroupById(params.id),
      getGroupsForDropdown(),
      getAllRegistrationsWithGroupStatus(params.id),
    ]);

    return {
      group,
      groupList,
      allRegistrations,
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
  const groupId = formData.get("groupId")?.toString() || params.id;
  const memberIds = formData.getAll("memberIds").filter((id) => id.toString());

  const validMemberIds = memberIds.filter((id) => id.toString().trim() !== "");

  try {
    const group = await getGroupById(params.id);
    const existingMemberIds = group.members.map((m) => m.id);

    const membersToRemove = existingMemberIds.filter(
      (id) => !validMemberIds.includes(id as string)
    );
    const membersToAdd = validMemberIds.filter(
      (id) => !existingMemberIds.includes(id as string)
    );

    const errors: string[] = [];

    for (const memberId of membersToRemove) {
      try {
        await removeFromGroup(memberId);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        }
      }
    }

    for (const memberId of membersToAdd) {
      try {
        await assignToGroup(memberId as string, groupId);
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
      "Group assignment updated successfully."
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update group assignment",
    };
  }
}

export default function EditGroupAssignment({ loaderData }: Route.ComponentProps) {
  const { group, groupList, allRegistrations } = loaderData;

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
      }}
      existingMembers={group.members}
      allRegistrations={allRegistrations}
      redirectPath="/conference-meetings/ypcl/group-assignments"
    />
  );
}
