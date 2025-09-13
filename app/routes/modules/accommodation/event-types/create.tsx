import { Form, useActionData, Link, redirect } from "react-router";
import type { Route } from "./+types/create";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { createEventType } from "~/lib/server/event-type.server";
import { auth } from "~/lib/auth.server";
import type { EventTypeFormData } from "~/types/accommodation.dto";

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData) as any;

  try {
    await createEventType({
      name: data.name,
      description: data.description || undefined,
    });

    return redirect("/accommodation/event-types");
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function CreateEventType() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Event Type</h1>
        <p className="text-gray-600">
          Add a new event type that can use accommodation facilities
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
              placeholder="e.g., Young People Church Living, District Conference, etc."
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of this event type"
              rows={3}
            />
          </div>

          {actionData?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{actionData.error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit">Create Event Type</Button>
            <Link to="/accommodation/event-types">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}