import { Form, useActionData, useLoaderData, Link, useSearchParams, redirect } from "react-router";
import type { Route } from "./+types/create";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { assignAccommodation } from "~/lib/server/accommodation.server";
import { getGenericRoomsList } from "~/lib/server/generic-accommodation.server";
import { getUnassignedRegistrations } from "~/lib/server/accommodation.server";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const [rooms, registrations] = await Promise.all([
    getGenericRoomsList({ isActive: true, pageSize: 100 }),
    getUnassignedRegistrations(),
  ]);

  return { rooms: rooms.data, registrations };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await assignAccommodation({
      roomId: data.roomId as string,
      registrationId: data.registrationId as string,
      bedNumber: data.bedNumber ? parseInt(data.bedNumber as string) : undefined,
      notes: (data.notes as string) || undefined,
    });

    return redirect("/accommodation/assignments");
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function CreateAccommodationAssignment() {
  const { rooms, registrations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const preselectedRoomId = searchParams.get("roomId");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Accommodation Assignment</h1>
        <p className="text-gray-600">
          Assign a registrant to an accommodation room
        </p>
      </div>

      <Card className="p-6">
        <Form method="post" className="space-y-6">
          <div>
            <Label htmlFor="registrationId">Registrant *</Label>
            <Select name="registrationId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a registrant" />
              </SelectTrigger>
              <SelectContent>
                {registrations.map((registration) => (
                  <SelectItem key={registration.id} value={registration.id}>
                    {registration.YoungPeople?.firstName} {registration.YoungPeople?.lastName} - {registration.Classification?.name} ({registration.GradeLevel?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="roomId">Room *</Label>
            <Select name="roomId" required defaultValue={preselectedRoomId || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} - {room.currentOccupancy}/{room.maxOccupancy} occupied
                    {room.EventType && ` (${room.EventType.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bedNumber">Bed Number (Optional)</Label>
            <Input
              id="bedNumber"
              name="bedNumber"
              type="number"
              min="1"
              placeholder="e.g., 1, 2, 3..."
            />
            <p className="text-sm text-gray-600 mt-1">
              Specify a particular bed number if applicable
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special notes or requirements"
              rows={3}
            />
          </div>

          {actionData?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{actionData.error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit">Create Assignment</Button>
            <Link to="/accommodation/assignments">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}