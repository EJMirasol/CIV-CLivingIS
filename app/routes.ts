import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  // Public home page
  index("routes/home.tsx"),
  route("sign-in", "./routes/modules/auth/sign-in.tsx"),
  route("sign-out", "./routes/modules/auth/sign-out.tsx"),

  // Main application routes with layout - protected with authentication
  layout("./routes/_layout.tsx", [
    ...prefix("dashboard", [index("./routes/modules/dashboard/index.tsx")]),
    ...prefix("conference-meetings", [
      ...prefix("ypcl", [
        // Church living index - requires authentication
        index("./routes/modules/conference-meetings/church-living/index.tsx"),
        // Dashboard sub-route - requires authentication
        route(
          "/dashboard",
          "./routes/modules/conference-meetings/church-living/dashboard.tsx"
        ),
        // Registration form - requires authentication
        route(
          "/register",
          "./routes/modules/conference-meetings/church-living/register.tsx"
        ),
        // Registration view/edit - requires authentication
        route(
          ":id",
          "./routes/modules/conference-meetings/church-living/$id.tsx"
        ),
        // Export data - requires authentication
        route(
          "/export",
          "./routes/modules/conference-meetings/church-living/export.tsx"
        ),
        // Check-in status - requires authentication
        route(
          "/status",
          "./routes/modules/conference-meetings/church-living/status.tsx"
        ),
        // Groups management - requires authentication
        ...prefix("groups", [
          index("./routes/modules/conference-meetings/church-living/groups.index.tsx"),
          route(
            "/create",
            "./routes/modules/conference-meetings/church-living/groups.create.tsx"
          ),
          route(
            ":id",
            "./routes/modules/conference-meetings/church-living/groups.$id.tsx"
          ),
          route(
            ":id/edit",
            "./routes/modules/conference-meetings/church-living/groups.$id.edit.tsx"
          ),
          route(
            ":id/assign",
            "./routes/modules/conference-meetings/church-living/groups.$id.assign.tsx"
          ),
        ]),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
