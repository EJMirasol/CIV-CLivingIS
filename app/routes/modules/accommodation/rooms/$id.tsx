import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/$id";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { getGenericRoomById } from "~/lib/server/generic-accommodation.server";
import { auth } from "~/lib/auth.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
  
  const url = new URL(request.url);
  const assignmentsPage = parseInt(url.searchParams.get("assignmentsPage") || "1");
  
  const room = await getGenericRoomById(params.id!, assignmentsPage, 10);
  if (!room) {
    throw new Response("Room not found", { status: 404 });
  }

  return { room };
}

export default function AccommodationRoomDetail() {
  const { room } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={room.isActive ? "default" : "secondary"}>
              {room.isActive ? "Active" : "Inactive"}
            </Badge>
            {room.EventType && (
              <Badge variant="outline">{room.EventType.name}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/accommodation/rooms/${room.id}/edit`}>
            <Button>Edit Room</Button>
          </Link>
          <Link to="/accommodation/rooms">
            <Button variant="outline">Back to Rooms</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Room Information</h3>
          <div className="space-y-3">
            {room.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="text-sm">{room.description}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Event Type</h4>
              <p className="text-sm">{room.EventType?.name || "Unassigned"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Number of Beds</h4>
              <p className="text-sm">{room.bedCount}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Max Occupancy</h4>
              <p className="text-sm">{room.maxOccupancy}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Current Occupancy</h4>
              <p className="text-sm">{room.currentOccupancy} / {room.maxOccupancy}</p>
            </div>
          </div>
        </Card>

        {/* Occupancy Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Occupancy Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Available Beds:</span>
              <span className="font-medium">{room.bedCount - room.currentOccupancy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Occupied Beds:</span>
              <span className="font-medium">{room.currentOccupancy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Assignments:</span>
              <span className="font-medium">{room.accommodationAssignments?.length || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(room.currentOccupancy / room.maxOccupancy) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {Math.round((room.currentOccupancy / room.maxOccupancy) * 100)}% occupied
            </p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to={`/accommodation/assignments/create?roomId=${room.id}`} className="block">
              <Button className="w-full" size="sm">
                Add Assignment
              </Button>
            </Link>
            <Link to={`/accommodation/assignments?roomId=${room.id}`} className="block">
              <Button variant="outline" className="w-full" size="sm">
                View All Assignments
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Assignments</h3>
        {room.accommodationAssignments && room.accommodationAssignments.length > 0 ? (
          <div className="space-y-3">
            {room.accommodationAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">
                    {assignment.Registration?.YoungPeople?.firstName}{" "}
                    {assignment.Registration?.YoungPeople?.lastName}
                  </h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>
                      Classification: {assignment.Registration?.Classification?.name}
                    </span>
                    <span>
                      Grade: {assignment.Registration?.GradeLevel?.name}
                    </span>
                    {assignment.bedNumber && (
                      <span>Bed: {assignment.bedNumber}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                  </p>
                  {assignment.notes && (
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      Note: {assignment.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No assignments yet</p>
            <Link to={`/accommodation/assignments/create?roomId=${room.id}`}>
              <Button>Add First Assignment</Button>
            </Link>
          </div>
        )}

        {/* Assignments Pagination */}
        {room.assignmentsPagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: room.assignmentsPagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                to={`?assignmentsPage=${page}`}
                className={`px-3 py-2 rounded ${
                  page === room.assignmentsPagination.pageNumber
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}