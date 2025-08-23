import { redirect } from "react-router";
import { parseWithZod } from "@conform-to/zod";
import { GroupFormSchema } from "~/types/group.dto";
import { GroupForm } from "~/components/forms/modules/groups/GroupForm";
import { createGroup } from "~/lib/server/groups.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import type { Route } from "./+types/groups.create";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
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

    await createGroup(groupData, session.user.id);
    
    return redirectWithSuccess(
      "/conference-meetings/ypcl/groups",
      "Group created successfully!"
    );
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to create group"],
    });
  }
}

export default function CreateGroup() {
  return <GroupForm />;
}