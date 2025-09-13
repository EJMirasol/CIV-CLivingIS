import { Form, useActionData, useLoaderData, Link, redirect } from "react-router";
import type { Route } from "./+types/create";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { createGenericRoom } from "~/lib/server/generic-accommodation.server";
import { getActiveEventTypes } from "~/lib/server/event-type.server";
import { auth } from "~/lib/auth.server";
import type { RoomFormData } from "~/types/accommodation.dto";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const eventTypes = await getActiveEventTypes();

  return { eventTypes };
}

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
    await createGenericRoom({
      name: data.name,
      description: data.description || undefined,
      bedCount: parseInt(data.bedCount),
      maxOccupancy: parseInt(data.maxOccupancy),
      eventTypeId: (data.eventTypeId === "none" || !data.eventTypeId) ? undefined : data.eventTypeId,
    });

    return redirect("/accommodation/rooms");
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function CreateAccommodationRoom() {
  const { eventTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configure New Room</h1>
        <p className="text-gray-600">
          Set up a new accommodation room configuration for specific meeting types or general use
        </p>
      </div>

      <Card className="p-6">
        <Form method="post" className="space-y-6">
          <div>
            <Label htmlFor="name">Room Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Room A, Dormitory 1, etc."
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of the room"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedCount">Number of Beds *</Label>
              <Input
                id="bedCount"
                name="bedCount"
                type="number"
                required
                min="1"
                placeholder="e.g., 4"
              />
            </div>

            <div>
              <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
              <Input
                id="maxOccupancy"
                name="maxOccupancy"
                type="number"
                required
                min="1"
                placeholder="e.g., 4"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="eventTypeId">Meeting Type Assignment</Label>
            <Select name="eventTypeId">
              <SelectTrigger>
                <SelectValue placeholder="Select meeting type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General use room</SelectItem>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.id} value={eventType.id}>
                    {eventType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Configure this room for a specific meeting type or set as general use
            </p>
          </div>

          {actionData?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{actionData.error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit">Configure Room</Button>
            <Link to="/accommodation/rooms">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}