import { redirect, useLoaderData, useFetcher } from "react-router";
import { Users, UserCheck, Search, Filter, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import type { Route } from "./+types/status";
import { 
  getRegistrationList, 
  getAllHalls, 
  getAllGenders, 
  getAllClassifications, 
  getAllGradeLevels,
  toggleCheckInStatus 
} from "~/lib/server/registration.server";
import { auth } from "~/lib/auth.server";
import { useState, useEffect } from "react";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import { Label } from "~/components/ui/label";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }

  const url = new URL(request.url);
  const searchParams = {
    hall: url.searchParams.get("hall") ?? "",
    ypfirstName: url.searchParams.get("ypfirstName") ?? "",
    gender: url.searchParams.get("gender") ?? "",
    classification: url.searchParams.get("classification") ?? "",
    gradeLevel: url.searchParams.get("gradeLevel") ?? "",
    pageNumber: parseInt(url.searchParams.get("pageNumber") ?? "1"),
    pageSize: parseInt(url.searchParams.get("pageSize") ?? "50"),
  };

  const [registrations, halls, genders, classifications, gradeLevels] = await Promise.all([
    getRegistrationList(searchParams),
    getAllHalls(),
    getAllGenders(),
    getAllClassifications(),
    getAllGradeLevels(),
  ]);

  return {
    registrations,
    halls,
    genders,
    classifications,
    gradeLevels,
    searchParams,
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
  const action = formData.get("action");
  const registrationId = formData.get("registrationId") as string;

  if (action === "toggleCheckIn" && registrationId) {
    try {
      const result = await toggleCheckInStatus(registrationId);
      return { success: true, message: result.message, isCheckedIn: result.isCheckedIn };
    } catch (error) {
      return { success: false, message: "Failed to update check-in status" };
    }
  }

  return { success: false, message: "Invalid action" };
}

export default function StatusPage() {
  const { registrations, halls, genders, classifications, gradeLevels, searchParams } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [filters, setFilters] = useState(searchParams);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const urlParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) urlParams.set(key, value.toString());
    });
    window.location.href = `${window.location.pathname}?${urlParams.toString()}`;
  };

  const clearFilters = () => {
    setFilters({
      hall: "",
      ypfirstName: "",
      gender: "",
      classification: "",
      gradeLevel: "",
      pageNumber: 1,
      pageSize: 50,
    });
    window.location.href = window.location.pathname;
  };

  const checkedInCount = registrations.data.filter(reg => reg.isCheckedIn).length;
  const totalCount = registrations.data.length;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md">
            <UserCheck className="h-5 w-5" />
          </div>
          <h1 className="text-base font-semibold">CHECK-IN STATUS & TAGGING</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {checkedInCount} Checked In
          </Badge>
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {totalCount} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-1">
                <Label>Search Name</Label>
                <Input
                  placeholder="First name..."
                  value={filters.ypfirstName}
                  onChange={(e) => handleFilterChange("ypfirstName", e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <Label>Gender</Label>
                <SelectBoxWithSearch
                  value={filters.gender}
                  onChange={(value) => handleFilterChange("gender", value)}
                  options={[
                    { id: "", name: "All Genders" },
                    ...genders.map((g) => ({ id: g.value, name: g.label }))
                  ]}
                />
              </div>

              <div className="space-y-1">
                <Label>Hall</Label>
                <SelectBoxWithSearch
                  value={filters.hall}
                  onChange={(value) => handleFilterChange("hall", value)}
                  options={[
                    { id: "", name: "All Halls" },
                    ...halls.map((h) => ({ id: h.value, name: h.label }))
                  ]}
                />
              </div>

              <div className="space-y-1">
                <Label>Classification</Label>
                <SelectBoxWithSearch
                  value={filters.classification}
                  onChange={(value) => handleFilterChange("classification", value)}
                  options={[
                    { id: "", name: "All Classifications" },
                    ...classifications.map((c) => ({ id: c.value, name: c.label }))
                  ]}
                />
              </div>

              <div className="space-y-1">
                <Label>Grade Level</Label>
                <SelectBoxWithSearch
                  value={filters.gradeLevel}
                  onChange={(value) => handleFilterChange("gradeLevel", value)}
                  options={[
                    { id: "", name: "All Grades" },
                    ...gradeLevels.map((gl) => ({ id: gl.value, name: gl.label }))
                  ]}
                />
              </div>

              <div className="space-y-1 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button onClick={applyFilters} className="flex-1">
                    <Search className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Registration List */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({registrations.pagination.totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {registrations.data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No registrations found matching your criteria.
              </div>
            ) : (
              registrations.data.map((registration) => (
                <div
                  key={registration.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    registration.isCheckedIn
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      registration.isCheckedIn ? "bg-green-500" : "bg-gray-400"
                    }`} />
                    
                    <div>
                      <div className="font-medium">
                        {registration.ypfirstName} {registration.yplastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {registration.classification} • {registration.gender} • {registration.gradeLevel}
                        {registration.hall && ` • ${registration.hall}`}
                      </div>
                      {registration.isCheckedIn && registration.checkedInAt && (
                        <div className="text-xs text-green-600">
                          Checked in: {new Date(registration.checkedInAt).toLocaleDateString()} {new Date(registration.checkedInAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {registration.isCheckedIn ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Not Checked In
                      </Badge>
                    )}

                    <fetcher.Form method="post">
                      <input type="hidden" name="action" value="toggleCheckIn" />
                      <input type="hidden" name="registrationId" value={registration.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={registration.isCheckedIn ? "outline" : "default"}
                        disabled={fetcher.state === "submitting"}
                      >
                        {fetcher.state === "submitting" ? "..." : 
                          registration.isCheckedIn ? "Check Out" : "Check In"}
                      </Button>
                    </fetcher.Form>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination could go here if needed */}
          {registrations.pagination.totalCount > registrations.pagination.pageSize && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((registrations.pagination.pageNumber - 1) * registrations.pagination.pageSize) + 1} to{' '}
                {Math.min(registrations.pagination.pageNumber * registrations.pagination.pageSize, registrations.pagination.totalCount)}{' '}
                of {registrations.pagination.totalCount} results
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}