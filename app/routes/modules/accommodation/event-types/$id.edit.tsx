import { Form, useActionData, useLoaderData, Link, redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { getEventTypeById, updateEventType } from "~/lib/server/event-type.server";
import { auth } from "~/lib/auth.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
  
  const eventType = await getEventTypeById(params.id!);
  if (!eventType) {
    throw new Response("Event type not found", { status: 404 });
  }

  return { eventType };
}

export async function action({ params, request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await updateEventType(params.id!, {
      name: data.name as string,
      description: (data.description as string) || undefined,
      isActive: data.isActive === "on",
    });

    return redirect("/accommodation/event-types");
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function EditEventType() {
  const { eventType } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Event Type</h1>
        <p className="text-gray-600">
          Update event type configuration
        </p>
      </div>

      <Card className="p-6">
        <Form method="post" className="space-y-6">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={eventType.name}
              placeholder="e.g., Young People Church Living, District Conference, etc."
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={eventType.description || ""}
              placeholder="Brief description of this event type"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={eventType.isActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {actionData?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{actionData.error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit">Update Event Type</Button>
            <Link to="/accommodation/event-types">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}