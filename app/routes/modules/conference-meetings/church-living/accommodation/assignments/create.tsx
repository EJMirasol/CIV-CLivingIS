import { Form, redirect, useActionData, useLoaderData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { Users, Home, Bed } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { Route } from "./+types/create";
import {
  getRoomsList,
  getUnassignedRegistrations,
  assignAccommodation,
} from "~/lib/server/accommodation.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const [roomsResult, unassignedRegistrations] = await Promise.all([
    getRoomsList({ pageSize: 1000, isActive: true }),
    getUnassignedRegistrations(),
  ]);

  const availableRooms = roomsResult.data.filter(
    (room) => room.currentOccupancy < room.maxOccupancy
  );

  return {
    rooms: availableRooms,
    registrations: unassignedRegistrations,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const roomId = formData.get("roomId")?.toString();
  const registrationId = formData.get("registrationId")?.toString();
  const bedNumber = formData.get("bedNumber")?.toString();
  const notes = formData.get("notes")?.toString().trim();

  const errors: Record<string, string> = {};

  if (!roomId) {
    errors.roomId = "Room selection is required";
  }
  
  if (!registrationId) {
    errors.registrationId = "Registrant selection is required";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await assignAccommodation({
      roomId: roomId!,
      registrationId: registrationId!,
      bedNumber: bedNumber ? parseInt(bedNumber) : undefined,
      assignedBy: session.user.id,
      notes: notes || undefined,
    });

    return redirectWithSuccess(
      "/conference-meetings/ypcl/accommodation/assignments",
      "Accommodation assigned successfully!"
    );
  } catch (error) {
    // Handle bed number duplicate error specifically
    if (error instanceof Error && error.message.includes("already assigned in this room")) {
      return { errors: { bedNumber: error.message } };
    }
    
    return redirectWithError(
      "/conference-meetings/ypcl/accommodation/assignments/create",
      error instanceof Error ? error.message : "Failed to create assignment"
    );
  }
}

export default function CreateAssignment() {
  const { rooms, registrations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const roomOptions = rooms.map((room) => ({
    id: room.id,
    name: `${room.name} (${room.currentOccupancy}/${room.maxOccupancy} occupied)`,
  }));

  const registrationOptions = registrations.map((reg) => ({
    id: reg.id,
    name: `${reg.YoungPeople.firstName.toUpperCase()} ${reg.YoungPeople.lastName.toUpperCase()} - ${reg.Classification.name} (${reg.YoungPeople.gender})`,
  }));

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <Users className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">Create Accommodation Assignment</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Assignment Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="POST" className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="registrationId" className="required">
                  Select Registrant
                </Label>
                <SelectBoxWithSearch
                  id="registrationId"
                  name="registrationId"
                  options={registrationOptions}
                  placeholder="Choose a registrant to assign..."
                />
                {actionData?.errors?.registrationId && (
                  <p className="text-sm text-red-600">{actionData.errors.registrationId}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="roomId" className="required">
                  Select Room
                </Label>
                <SelectBoxWithSearch
                  id="roomId"
                  name="roomId"
                  options={roomOptions}
                  placeholder="Choose an available room..."
                />
                {actionData?.errors?.roomId && (
                  <p className="text-sm text-red-600">{actionData.errors.roomId}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="bedNumber">
                  <Bed className="h-4 w-4 inline mr-1" />
                  Bed Number (Optional)
                </Label>
                <Input
                  id="bedNumber"
                  name="bedNumber"
                  type="number"
                  min="1"
                  placeholder="Specific bed number (if applicable)"
                />
                {actionData?.errors?.bedNumber && (
                  <p className="text-sm text-red-600">{actionData.errors.bedNumber}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special notes or requirements..."
                  rows={3}
                />
                {actionData?.errors?.notes && (
                  <p className="text-sm text-red-600">{actionData.errors.notes}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <BackButton 
                  to="/conference-meetings/ypcl/accommodation/assignments" 
                  variant="outline" 
                />
                <Button type="submit" className="bg-[#213b36]">
                  Create Assignment
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Available Rooms</h4>
              <div className="space-y-2">
                {rooms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rooms available</p>
                ) : (
                  rooms.slice(0, 5).map((room) => (
                    <div key={room.id} className="p-2 border rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{room.name}</p>
                          {room.description && (
                            <p className="text-xs text-muted-foreground">
                              {room.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {room.currentOccupancy}/{room.maxOccupancy}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {room.bedCount} beds • {room.maxOccupancy - room.currentOccupancy} available
                      </p>
                    </div>
                  ))
                )}
                {rooms.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {rooms.length - 5} more available rooms
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Unassigned Registrants</h4>
              <div className="space-y-2">
                {registrations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All registrants assigned</p>
                ) : (
                  registrations.slice(0, 5).map((reg) => (
                    <div key={reg.id} className="p-2 border rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium uppercase">
                            {reg.YoungPeople.firstName} {reg.YoungPeople.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reg.Classification.name} - {reg.GradeLevel.name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {reg.YoungPeople.gender}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
                {registrations.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {registrations.length - 5} more unassigned registrants
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}