import { Link, redirect, useLoaderData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Home, Users, Bed, Calendar } from "lucide-react";
import type { Route } from "./+types/index";
import { auth } from "~/lib/auth.server";
import { getAccommodationStatistics } from "~/lib/server/accommodation.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
  
  const statistics = await getAccommodationStatistics();
  return { statistics };
}

export default function AccommodationDashboard() {
  const { statistics } = useLoaderData<typeof loader>();
  
  const features = [
    {
      title: "Room Management",
      description: "Create, edit, and manage accommodation rooms with bed assignments",
      icon: Home,
      href: "/conference-meetings/ypcl/accommodation/rooms",
      color: "bg-blue-500",
    },
    {
      title: "Assignment Management",
      description: "Assign registrants to rooms and manage bed assignments",
      icon: Users,
      href: "/conference-meetings/ypcl/accommodation/assignments",
      color: "bg-green-500",
    },
  ];

  const stats = [
    {
      title: "Total Rooms",
      value: statistics.totalRooms.toString(),
      icon: Home,
      description: "Available rooms",
    },
    {
      title: "Occupied Beds",
      value: statistics.occupiedBeds.toString(),
      icon: Bed,
      description: "Currently assigned",
    },
    {
      title: "Available Beds",
      value: statistics.availableBeds.toString(),
      icon: Calendar,
      description: "Ready for assignment",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <Home className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">YP Church Living Accommodation</h1>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accommodation Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage rooms and assignments for YP Church Living events.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.href}>
                <Button variant="outline" className="w-full justify-start">
                  <feature.icon className="h-4 w-4 mr-2" />
                  {feature.title}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}