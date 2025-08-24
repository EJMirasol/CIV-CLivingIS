import { Form, redirect, useActionData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { BackButton } from "~/components/shared/buttons/BackButton";
import { Home } from "lucide-react";
import type { Route } from "./+types/create";
import { createRoom } from "~/lib/server/accommodation.server";
import { auth } from "~/lib/auth.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

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
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const bedCount = parseInt(formData.get("bedCount")?.toString() || "0");
  const maxOccupancy = parseInt(formData.get("maxOccupancy")?.toString() || "0");

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
    await createRoom({
      name: name!,
      description: description || undefined,
      bedCount,
      maxOccupancy,
      createdBy: session.user.id,
    });

    return redirectWithSuccess(
      "/conference-meetings/ypcl/accommodation/rooms",
      "Room created successfully!"
    );
  } catch (error) {
    return redirectWithError(
      "/conference-meetings/ypcl/accommodation/rooms/create",
      error instanceof Error ? error.message : "Failed to create room"
    );
  }
}

export default function CreateRoom() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <Home className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">Create New Room</h1>
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
                  placeholder="Maximum occupants"
                  required
                />
                {actionData?.errors?.maxOccupancy && (
                  <p className="text-sm text-red-600">{actionData.errors.maxOccupancy}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <BackButton 
                to="/conference-meetings/ypcl/accommodation/rooms" 
                variant="outline" 
              />
              <Button type="submit" className="bg-[#213b36]">
                Create Room
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}