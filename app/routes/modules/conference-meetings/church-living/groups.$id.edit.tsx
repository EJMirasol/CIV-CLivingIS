import { redirect, useLoaderData } from "react-router";
import { parseWithZod } from "@conform-to/zod";
import { GroupFormSchema } from "~/components/forms/modules/groups/dto/group.dto";
import { GroupForm } from "~/components/forms/modules/groups/GroupForm";
import { getGroupById, updateGroup } from "~/utils/groups.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import type { Route } from "./+types/groups.$id.edit";

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
    return { 
      group: {
        name: group.name,
        description: group.description || "",
        maxMembers: group.maxMembers || undefined,
      }
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
  const submission = parseWithZod(formData, { schema: GroupFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const groupData = {
      name: submission.value.name,
      description: submission.value.description,
      maxMembers: submission.value.maxMembers 
        ? parseInt(submission.value.maxMembers, 10) 
        : undefined,
    };

    await updateGroup(params.id, groupData);
    
    return redirectWithSuccess(
      `/conference-meetings/ypcl/groups/${params.id}`,
      "Group updated successfully!"
    );
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to update group"],
    });
  }
}

export default function EditGroup() {
  const { group } = useLoaderData<typeof loader>();
  
  return <GroupForm defaultValues={group} isEdit={true} />;
}