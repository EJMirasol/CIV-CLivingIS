import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  Users, 
  UserCheck, 
  Clock, 
  MapPin, 
  GraduationCap, 
  Tag, 
  Layers, 
  CheckCircle,
  UserMinus
} from "lucide-react";
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
    groupInfo,
    recentRegistrations,
  } = statistics;

  const brothersCount = genderDistribution.find(g => g.gender === 'Brother')?.count || 0;
  const sistersCount = genderDistribution.find(g => g.gender === 'Sister')?.count || 0;

  const cardClassName = "bg-white border border-slate-200 hover:border-emerald-950 motion-safe:transition-colors motion-safe:duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-950 focus-visible:ring-offset-2 h-full";
  const iconClassName = "h-5 w-5 text-slate-500 group-hover:text-emerald-950 motion-safe:transition-colors motion-safe:duration-200";
  const titleClassName = "text-sm font-semibold text-slate-700";
  const numberClassName = "text-3xl font-bold text-slate-900 mb-1";
  const subtitleClassName = "text-sm text-slate-500";

  return (
    <div className="space-y-8">
      {/* Overview Cards - 8 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Registered */}
        <Link to="/conference-meetings/ypcl/" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Total Registered</CardTitle>
              <Users className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{totalRegistrations}</div>
              <p className={subtitleClassName}>Young people registered</p>
            </CardContent>
          </Card>
        </Link>

        {/* 2. Brothers */}
        <Link to="/conference-meetings/ypcl/" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Brothers</CardTitle>
              <UserCheck className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{brothersCount}</div>
              <p className={subtitleClassName}>
                {totalRegistrations > 0 ? Math.round((brothersCount / totalRegistrations) * 100) : 0}% of registrations
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 3. Sisters */}
        <Link to="/conference-meetings/ypcl/" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Sisters</CardTitle>
              <UserCheck className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{sistersCount}</div>
              <p className={subtitleClassName}>
                {totalRegistrations > 0 ? Math.round((sistersCount / totalRegistrations) * 100) : 0}% of registrations
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 4. Checked In */}
        <Link to="/conference-meetings/ypcl/" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Checked In</CardTitle>
              <CheckCircle className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{totalCheckedIn}</div>
              <p className={subtitleClassName}>
                {totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}% of registrations
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 5. Total Groups */}
        <Link to="/conference-meetings/ypcl/groups" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Total Groups</CardTitle>
              <Layers className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{groupInfo.totalGroups}</div>
              <p className={subtitleClassName}>Active groups created</p>
            </CardContent>
          </Card>
        </Link>

        {/* 6. Assigned Members */}
        <Link to="/conference-meetings/ypcl/groups" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Assigned</CardTitle>
              <UserCheck className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{groupInfo.totalAssignedMembers}</div>
              <p className={subtitleClassName}>{groupInfo.assignmentPercentage}% assigned</p>
            </CardContent>
          </Card>
        </Link>

        {/* 7. Unassigned Members */}
        <Link to="/conference-meetings/ypcl/groups" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Unassigned</CardTitle>
              <UserMinus className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{groupInfo.totalUnassignedMembers}</div>
              <p className={subtitleClassName}>Waiting for group</p>
            </CardContent>
          </Card>
        </Link>

        {/* 8. Assignment Rate */}
        <Link to="/conference-meetings/ypcl/groups" className="group">
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={titleClassName}>Assignment Rate</CardTitle>
              <Layers className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={numberClassName}>{groupInfo.assignmentPercentage}%</div>
              <p className={subtitleClassName}>Overall completion</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Distributions and Recent Registrations - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Distributions */}
        <Card className="bg-white border border-slate-200 self-start">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-slate-500" />
              <Tag className="h-4 w-4 text-slate-500" />
              <MapPin className="h-4 w-4 text-slate-500" />
              Distributions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Single Table Header */}
            <div className="grid grid-cols-[1fr_auto] py-2 border-b border-slate-300 font-medium text-xs text-slate-500 uppercase tracking-wider">
              <div>Name</div>
              <div className="text-right pr-2">Count</div>
            </div>

            {/* Grade Levels Section */}
            <div className="mt-4 mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Grade Levels
              </h3>
              {gradeLevelDistribution.map((level) => (
                <div 
                  key={level.name} 
                  className="grid grid-cols-[1fr_auto] py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-700">{level.name}</span>
                  <span className="text-sm font-medium text-slate-900 text-right pr-2">{level.count}</span>
                </div>
              ))}
            </div>

            {/* Classifications Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Classifications
              </h3>
              {classificationDistribution.map((classification) => (
                <div 
                  key={classification.name} 
                  className="grid grid-cols-[1fr_auto] py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-700">{classification.name}</span>
                  <span className="text-sm font-medium text-slate-900 text-right pr-2">{classification.count}</span>
                </div>
              ))}
            </div>

            {/* Halls Section */}
            {hallDistribution.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Halls
                </h3>
                {hallDistribution.map((hall) => (
                  <div 
                    key={hall.name} 
                    className="grid grid-cols-[1fr_auto] py-2 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-sm text-slate-700">{hall.name}</span>
                    <span className="text-sm font-medium text-slate-900 text-right pr-2">{hall.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="bg-white border border-slate-200 self-start">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-medium">
              <Clock className="h-4 w-4 text-slate-500" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {recentRegistrations.length > 0 ? (
                recentRegistrations.slice(0, 5).map((registration) => (
                  <Link
                    key={registration.id}
                    to={`/conference-meetings/ypcl/${registration.id}`}
                    className="block group border-b border-slate-100 last:border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-950 focus-visible:ring-offset-2"
                  >
                    <div className="py-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900 group-hover:text-emerald-950 motion-safe:transition-colors motion-safe:duration-200">
                            {registration.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {registration.classification} • {registration.gender}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(registration.dateRegistered).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No recent registrations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
