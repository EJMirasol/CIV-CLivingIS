import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, UserCheck, Heart, Clock, TrendingUp, MapPin, GraduationCap, Tag, Layers, CheckCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";

interface DashboardStatsProps {
  statistics: {
    totalRegistrations: number;
    totalCheckedIn: number;
    genderDistribution: { gender: string; count: number }[];
    gradeLevelDistribution: { name: string; count: number }[];
    classificationDistribution: { name: string; count: number }[];
    hallDistribution: { name: string; count: number }[];
    healthInfo: { allergies: number; healthConditions: number };
    groupInfo: {
      totalGroups: number;
      totalAssignedMembers: number;
      totalUnassignedMembers: number;
      assignmentPercentage: number;
      topGroups: {
        id: string;
        name: string;
        currentMembers: number;
        maxMembers: number | null;
        utilizationPercentage: number | null;
      }[];
    };
    recentRegistrations: {
      id: string;
      name: string;
      gender: string;
      classification: string;
      dateRegistered: Date;
    }[];
  };
}

export function DashboardStats({ statistics }: DashboardStatsProps) {
  const {
    totalRegistrations,
    totalCheckedIn,
    genderDistribution,
    gradeLevelDistribution,
    classificationDistribution,
    hallDistribution,
    healthInfo,
    groupInfo,
    recentRegistrations,
  } = statistics;

  const brothersCount = genderDistribution.find(g => g.gender === 'Brother')?.count || 0;
  const sistersCount = genderDistribution.find(g => g.gender === 'Sister')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Registered</CardTitle>
            <div className="p-2 bg-slate-200 rounded-xl">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 mb-1">{totalRegistrations}</div>
            <p className="text-sm text-slate-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Young people registered
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700">Brothers</CardTitle>
            <div className="p-2 bg-blue-200 rounded-xl">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">{brothersCount}</div>
            <p className="text-sm text-blue-600 flex items-center gap-1">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-2 py-0.5 text-xs">
                {totalRegistrations > 0 ? Math.round((brothersCount / totalRegistrations) * 100) : 0}%
              </Badge>
              of registrations
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-pink-700">Sisters</CardTitle>
            <div className="p-2 bg-pink-200 rounded-xl">
              <UserCheck className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-700 mb-1">{sistersCount}</div>
            <p className="text-sm text-pink-600 flex items-center gap-1">
              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 px-2 py-0.5 text-xs">
                {totalRegistrations > 0 ? Math.round((sistersCount / totalRegistrations) * 100) : 0}%
              </Badge>
              of registrations
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700">Checked In</CardTitle>
            <div className="p-2 bg-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-1">{totalCheckedIn}</div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-2 py-0.5 text-xs">
                {totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}%
              </Badge>
              of registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Total Groups Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700">Total Groups</CardTitle>
            <div className="p-2 bg-purple-200 rounded-xl">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-1">{groupInfo.totalGroups}</div>
            <p className="text-sm text-purple-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Active groups created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Level Distribution */}
        <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gray-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-gray-600" />
              </div>
              Grade Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gradeLevelDistribution.map((level, index) => (
                <div key={level.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: `hsl(${index * 40}, 70%, 60%)` 
                      }}
                    />
                    <span className="text-sm font-medium">{level.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{level.count}</span>
                    <Badge variant="secondary">
                      {totalRegistrations > 0 ? Math.round((level.count / totalRegistrations) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Classification Distribution */}
        <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Tag className="h-5 w-5 text-gray-600" />
              </div>
              Classification Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classificationDistribution.map((classification, index) => (
                <div key={classification.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: `hsl(${index * 60 + 180}, 70%, 60%)` 
                      }}
                    />
                    <span className="text-sm font-medium">{classification.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{classification.count}</span>
                    <Badge variant="secondary">
                      {totalRegistrations > 0 ? Math.round((classification.count / totalRegistrations) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hall Distribution and Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hall Distribution */}
        {hallDistribution.length > 0 && (
          <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                Hall Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hallDistribution.map((hall, index) => (
                  <div key={hall.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: `hsl(${index * 45 + 90}, 70%, 60%)` 
                        }}
                      />
                      <span className="text-sm font-medium">{hall.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{hall.count}</span>
                      <Badge variant="secondary">
                        {totalRegistrations > 0 ? Math.round((hall.count / totalRegistrations) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Registrations */}
        <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRegistrations.length > 0 ? (
                recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium text-sm">{registration.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {registration.classification} • {registration.gender}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(registration.dateRegistered).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No registrations yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Health Information Summary */}
      {(healthInfo.allergies > 0 || healthInfo.healthConditions > 0) && (
        <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Heart className="h-5 w-5 text-gray-600" />
              </div>
              Health Information Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                <div>
                  <div className="font-medium text-red-800">Allergies</div>
                  <div className="text-sm text-red-600">
                    {healthInfo.allergies} registrations have allergy information
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">{healthInfo.allergies}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div>
                  <div className="font-medium text-orange-800">Health Conditions</div>
                  <div className="text-sm text-orange-600">
                    {healthInfo.healthConditions} registrations have health conditions
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600">{healthInfo.healthConditions}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}