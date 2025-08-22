import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, UserCheck, Heart, Clock, TrendingUp, MapPin, GraduationCap, Tag } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface DashboardStatsProps {
  statistics: {
    totalRegistrations: number;
    genderDistribution: { gender: string; count: number }[];
    gradeLevelDistribution: { name: string; count: number }[];
    classificationDistribution: { name: string; count: number }[];
    hallDistribution: { name: string; count: number }[];
    healthInfo: { allergies: number; healthConditions: number };
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
    genderDistribution,
    gradeLevelDistribution,
    classificationDistribution,
    hallDistribution,
    healthInfo,
    recentRegistrations,
  } = statistics;

  const brothersCount = genderDistribution.find(g => g.gender === 'Brother')?.count || 0;
  const sistersCount = genderDistribution.find(g => g.gender === 'Sister')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Young people registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brothers</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{brothersCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalRegistrations > 0 ? Math.round((brothersCount / totalRegistrations) * 100) : 0}% of registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisters</CardTitle>
            <UserCheck className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{sistersCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalRegistrations > 0 ? Math.round((sistersCount / totalRegistrations) * 100) : 0}% of registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Alerts</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {healthInfo.allergies + healthInfo.healthConditions}
            </div>
            <p className="text-xs text-muted-foreground">
              {healthInfo.allergies} allergies, {healthInfo.healthConditions} conditions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
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