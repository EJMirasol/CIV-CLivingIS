import { redirect } from "react-router";
import { parseWithZod } from "@conform-to/zod";
import { GroupFormSchema } from "~/types/group.dto";
import { GroupForm } from "~/components/forms/modules/groups/GroupForm";
import { createGroup } from "~/lib/server/groups.server";
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
      description: submission.value.description || undefined,
      maxMembers: parseInt(submission.value.maxMembers!, 10),
      conferenceType: submission.value.conferenceType,
    };

    await createGroup(groupData, session.user.id);
    
    return redirectWithSuccess(
      "/utilities/groups",
      "Group added successfully!"
    );
  } catch (error) {
    return submission.reply({
      formErrors: [error instanceof Error ? error.message : "Failed to add group"],
    });
  }
}

export default function AddGroup() {
  return <GroupForm redirectPath="/utilities/groups" />;
}
