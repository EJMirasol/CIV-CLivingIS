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
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grade Level Distribution */}
        <Card className="bg-white border border-gray-200 hover:shadow-sm transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-gray-600" />
              Grade Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div 
              className="space-y-2 overflow-y-auto" 
              style={{ 
                maxHeight: `${Math.min(gradeLevelDistribution.length * 40 + 20, 300)}px`
              }}
            >
              {gradeLevelDistribution.map((level, index) => {
                const percentage = totalRegistrations > 0 ? Math.round((level.count / totalRegistrations) * 100) : 0;
                return (
                  <div key={level.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: `hsl(${index * 40}, 60%, 50%)` }}
                      />
                      <span className="text-xs text-gray-700">{level.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">{level.count}</span>
                      <span className=" text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Classification Distribution */}
        <Card className="bg-white border border-gray-200 hover:shadow-sm transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-sm font-medium">
              <Tag className="h-4 w-4 text-gray-600" />
              Classification Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {classificationDistribution.map((classification, index) => {
                const percentage = totalRegistrations > 0 ? Math.round((classification.count / totalRegistrations) * 100) : 0;
                return (
                  <div key={classification.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: `hsl(${index * 60 + 180}, 60%, 50%)` }}
                      />
                      <span className="text-sm text-gray-700">{classification.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{classification.count}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hall Distribution and Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hall Distribution */}
        {hallDistribution.length > 0 && (
          <Card className="bg-white border border-gray-200 hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-sm font-medium">
                <MapPin className="h-4 w-4 text-gray-600" />
                Hall Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {hallDistribution.map((hall, index) => {
                  const percentage = totalRegistrations > 0 ? Math.round((hall.count / totalRegistrations) * 100) : 0;
                  return (
                    <div key={hall.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: `hsl(${index * 45 + 90}, 60%, 50%)` }}
                        />
                        <span className="text-sm text-gray-700">{hall.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{hall.count}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Registrations */}
        <Card className="bg-white border border-gray-200 hover:shadow-sm transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-sm font-medium">
              <Clock className="h-4 w-4 text-gray-600" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentRegistrations.length > 0 ? (
                recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{registration.classification}</span>
                        <span>•</span>
                        <span>{registration.gender}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(registration.dateRegistered).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent registrations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Health Information Summary */}
      {(healthInfo.allergies > 0 || healthInfo.healthConditions > 0) && (
        <Card className="bg-white border border-gray-200 hover:shadow-sm transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-sm font-medium">
              <Heart className="h-4 w-4 text-gray-600" />
              Health Information Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-red-800">Allergies</div>
                  <div className="text-xs text-red-600">
                    {healthInfo.allergies} registrations
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-700">{healthInfo.allergies}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-orange-800">Health Conditions</div>
                  <div className="text-xs text-orange-600">
                    {healthInfo.healthConditions} registrations
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-700">{healthInfo.healthConditions}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}