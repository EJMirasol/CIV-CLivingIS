import { Form, useActionData, useLoaderData, Link, redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getGenericRoomById, updateGenericRoom } from "~/lib/server/generic-accommodation.server";
import { getActiveEventTypes } from "~/lib/server/event-type.server";
import { auth } from "~/lib/auth.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
  
  const [room, eventTypes] = await Promise.all([
    getGenericRoomById(params.id!),
    getActiveEventTypes(),
  ]);

  if (!room) {
    throw new Response("Room not found", { status: 404 });
  }

  return { room, eventTypes };
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
    await updateGenericRoom(params.id!, {
      name: data.name as string,
      description: (data.description as string) || undefined,
      bedCount: parseInt(data.bedCount as string),
      maxOccupancy: parseInt(data.maxOccupancy as string),
      eventTypeId: (data.eventTypeId as string === "none" || !data.eventTypeId) ? undefined : (data.eventTypeId as string),
      isActive: data.isActive === "on",
    });

    return redirect(`/accommodation/rooms/${params.id}`);
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function EditAccommodationRoom() {
  const { room, eventTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Room</h1>
        <p className="text-gray-600">
          Update accommodation room details and settings
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
              defaultValue={room.name}
              placeholder="e.g., Room A, Dormitory 1, etc."
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={room.description || ""}
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
                defaultValue={room.bedCount}
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
                defaultValue={room.maxOccupancy}
                placeholder="e.g., 4"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="eventTypeId">Event Type</Label>
            <Select name="eventTypeId" defaultValue={room.eventTypeId || "none"}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific event type</SelectItem>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.id} value={eventType.id}>
                    {eventType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Assign this room to a specific event type or leave unassigned for general use
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={room.isActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {actionData?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{actionData.error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit">Update Room</Button>
            <Link to={`/accommodation/rooms/${room.id}`}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}