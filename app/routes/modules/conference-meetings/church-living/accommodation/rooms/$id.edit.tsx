import { Form, redirect, useActionData, useLoaderData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { Home } from "lucide-react";
import type { Route } from "./+types/$id.edit";
import { getRoomById, updateRoom } from "~/lib/server/accommodation.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const room = await getRoomById(params.id);
  
  if (!room) {
    throw new Response("Room not found", { status: 404 });
  }

  return { room };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const bedCount = parseInt(formData.get("bedCount")?.toString() || "0");
  const maxOccupancy = parseInt(formData.get("maxOccupancy")?.toString() || "0");
  const isActive = formData.get("isActive") === "on";

  const errors: Record<string, string> = {};

  if (!name) {
    errors.name = "Room name is required";
  }
  
  if (!bedCount || bedCount <= 0) {
    errors.bedCount = "Bed count must be greater than 0";
  }
  
  if (!maxOccupancy || maxOccupancy <= 0) {
    errors.maxOccupancy = "Max occupancy must be greater than 0";
  }
  
  if (maxOccupancy > bedCount) {
    errors.maxOccupancy = "Max occupancy cannot exceed bed count";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await updateRoom(params.id, {
      name: name!,
      description: description || undefined,
      bedCount,
      maxOccupancy,
      isActive,
    });

    return redirectWithSuccess(
      `/conference-meetings/ypcl/accommodation/rooms/${params.id}`,
      "Room updated successfully!"
    );
  } catch (error) {
    return redirectWithError(
      `/conference-meetings/ypcl/accommodation/rooms/${params.id}/edit`,
      error instanceof Error ? error.message : "Failed to update room"
    );
  }
}

export default function EditRoom() {
  const { room } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <Home className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">Edit Room: {room.name}</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Room Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="POST" className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="required">
                Room Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={room.name}
                placeholder="Enter room name (e.g., Room A1, Dormitory 101)"
                required
              />
              {actionData?.errors?.name && (
                <p className="text-sm text-red-600">{actionData.errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={room.description || ""}
                placeholder="Optional description (e.g., location, amenities)"
                rows={3}
              />
              {actionData?.errors?.description && (
                <p className="text-sm text-red-600">{actionData.errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="bedCount" className="required">
                  Bed Count
                </Label>
                <Input
                  id="bedCount"
                  name="bedCount"
                  type="number"
                  min="1"
                  defaultValue={room.bedCount}
                  placeholder="Number of beds"
                  required
                />
                {actionData?.errors?.bedCount && (
                  <p className="text-sm text-red-600">{actionData.errors.bedCount}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="maxOccupancy" className="required">
                  Max Occupancy
                </Label>
                <Input
                  id="maxOccupancy"
                  name="maxOccupancy"
                  type="number"
                  min="1"
                  defaultValue={room.maxOccupancy}
                  placeholder="Maximum occupants"
                  required
                />
                {actionData?.errors?.maxOccupancy && (
                  <p className="text-sm text-red-600">{actionData.errors.maxOccupancy}</p>
                )}
                {room.currentOccupancy > 0 && (
                  <p className="text-sm text-amber-600">
                    Warning: This room currently has {room.currentOccupancy} assignments.
                    Ensure the new max occupancy accommodates existing assignments.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                defaultChecked={room.isActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <BackButton 
                to={`/conference-meetings/ypcl/accommodation/rooms/${room.id}`}
                variant="outline" 
              />
              <Button type="submit" className="bg-[#213b36]">
                Update Room
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}