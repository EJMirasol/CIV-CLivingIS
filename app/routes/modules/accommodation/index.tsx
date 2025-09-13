import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/index";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getGenericAccommodationStatistics } from "~/lib/server/generic-accommodation.server";
import { getActiveEventTypes } from "~/lib/server/event-type.server";
import { auth } from "~/lib/auth.server"; 
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const [statistics, eventTypes] = await Promise.all([
    getGenericAccommodationStatistics(),
    getActiveEventTypes(),
  ]);

  return { statistics, eventTypes };
}

export default function AccommodationIndex() {
  const { statistics, eventTypes } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accommodation Configuration</h1>
          <p className="text-gray-600">
            Configure accommodation utilities for different types of meetings and conferences
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Rooms</h3>
          <p className="text-2xl font-bold text-blue-600">{statistics.totalRooms}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Beds</h3>
          <p className="text-2xl font-bold text-green-600">{statistics.totalBeds}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Occupied Beds</h3>
          <p className="text-2xl font-bold text-orange-600">{statistics.occupiedBeds}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Available Beds</h3>
          <p className="text-2xl font-bold text-purple-600">{statistics.availableBeds}</p>
        </Card>
      </div>

      {/* Configuration Utilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Meeting Types Configuration</h3>
          <p className="text-gray-600 mb-4">
            Set up and configure different types of meetings or conferences that require accommodation facilities.
          </p>
          <div className="space-y-2">
            <Link to="/accommodation/event-types">
              <Button className="w-full">Configure Meeting Types</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Room Management Utilities</h3>
          <p className="text-gray-600 mb-4">
            Manage accommodation rooms and configure them for specific meeting types and events.
          </p>
          <div className="space-y-2">
            <Link to="/accommodation/rooms">
              <Button className="w-full">Manage Rooms</Button>
            </Link>
            <Link to="/accommodation/assignments">
              <Button variant="outline" className="w-full">View Assignments</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Currently Configured Meeting Types */}
      {eventTypes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Currently Configured Meeting Types</h3>
          <p className="text-sm text-gray-600 mb-4">
            These are the meeting/conference types that have been set up to use accommodation facilities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTypes.map((eventType) => (
              <div key={eventType.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">{eventType.name}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Active
                  </span>
                </div>
                {eventType.description && (
                  <p className="text-sm text-blue-700 mt-1 mb-3">{eventType.description}</p>
                )}
                <div className="flex gap-2">
                  <Link 
                    to={`/accommodation/rooms?eventType=${eventType.id}`}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Configure Rooms
                  </Link>
                  <Link 
                    to={`/accommodation/event-types/${eventType.id}/edit`}
                    className="text-xs border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    Edit Settings
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}