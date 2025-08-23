import { redirect, useLoaderData } from "react-router";
import { Users, UserMinus, Edit, Calendar, Hash, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { getGroupById, removeFromGroup } from "~/utils/groups.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess } from "remix-toast";
import type { Route } from "./+types/groups.$id";
import { Link, useSubmit } from "react-router";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { BackButton } from "~/components/shared/buttons/BackButton";

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
    return { group };
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

  const formData = await request.formData();
  const intent = formData.get("intent");
  const registrationId = formData.get("registrationId");

  if (intent === "remove" && registrationId) {
    try {
      await removeFromGroup(registrationId.toString());
      return redirectWithSuccess(
        `/conference-meetings/ypcl/groups/${params.id}`,
        "Member removed from group successfully!"
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to remove member" };
    }
  }

  return { error: "Invalid action" };
}

export default function GroupDetail() {
  const { group } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const utilizationPercentage = group.maxMembers
    ? Math.round((group.currentMembers / group.maxMembers) * 100)
    : null;

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-base font-semibold">GROUP DETAILS</h1>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <BackButton />
        </div>
        <div className="flex gap-2">
          <Link to={`/conference-meetings/ypcl/groups/${group.id}/assign`}>
            <Button className="bg-[#213b36] hover:bg-[#1a2f29]">
              <Users className="h-4 w-4 mr-2" />
              Assign Members
            </Button>
          </Link>
          <Link to={`/conference-meetings/ypcl/groups/${group.id}/edit`}>
            <Button className="bg-[#213b36]" variant="view">
              <Edit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          </Link>
        </div>
      </div>

      {/* Group Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{group.name}</span>
            {!group.isActive && (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                Group ID
              </div>
              <p className="font-mono text-xs">{group.id}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Members
              </div>
              <p className="text-lg font-semibold">
                {group.currentMembers}
                {group.maxMembers && ` / ${group.maxMembers}`}
              </p>
              {utilizationPercentage !== null && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      utilizationPercentage >= 100
                        ? "bg-red-500"
                        : utilizationPercentage >= 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created
              </div>
              <p>{new Date(group.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {group.description && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members ({group.currentMembers})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {group.members.length > 0 ? (
            <div className="space-y-3">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {member.gender}
                        </span>
                        <span>
                          {member.gradeLevel}
                        </span>
                        <span>
                          {member.classification}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Member</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove{" "}
                          <strong>{member.name}</strong> from the group{" "}
                          <strong>{group.name}</strong>?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex flex-row items-baseline md:justify-end justify-center gap-2">
                        <DialogClose className="w-[70px]" asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose className="w-[70px]" asChild>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const formData = new FormData();
                              formData.append("intent", "remove");
                              formData.append("registrationId", member.id);
                              submit(formData, { method: "POST" });
                            }}
                          >
                            Remove
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No members assigned to this group yet.</p>
              <Link to={`/conference-meetings/ypcl/groups/${group.id}/assign`}>
                <Button className="mt-3 bg-[#213b36] hover:bg-[#1a2f29]">
                  Assign Members
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}