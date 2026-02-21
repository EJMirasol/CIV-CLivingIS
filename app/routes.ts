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
        // Dashboard sub-route - requires authentication
        route(
          "/dashboard",
          "./routes/modules/conference-meetings/church-living/dashboard/index.tsx"
        ),
        // Registration list - requires authentication
        route(
          "/registration",
          "./routes/modules/conference-meetings/church-living/index.tsx"
        ),
        // Registration form (add new) - requires authentication
        route(
          "/registration/add",
          "./routes/modules/conference-meetings/church-living/register.tsx"
        ),
        // Registration view/edit - requires authentication
        route(
          "/registration/:id",
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
          "./routes/modules/conference-meetings/church-living/status/index.tsx"
        ),
        // Group Assignments - requires authentication
        route(
          "/group-assignments",
          "./routes/modules/conference-meetings/church-living/group-assignments/index.tsx"
        ),
        route(
          "/group-assignments/add",
          "./routes/modules/conference-meetings/church-living/group-assignments/add.tsx"
        ),
        route(
          "/group-assignments/:id",
          "./routes/modules/conference-meetings/church-living/group-assignments/$id.tsx"
        ),
        // Accommodation management - requires authentication
        route(
          "/accommodation",
          "./routes/modules/conference-meetings/church-living/accommodation/index.tsx"
        ),
        route(
          "/accommodation/assignments",
          "./routes/modules/conference-meetings/church-living/accommodation/assignments/index.tsx"
        ),
        route(
          "/accommodation/assignments/create",
          "./routes/modules/conference-meetings/church-living/accommodation/assignments/create.tsx"
        ),
      ]),
    ]),
    // Utilities module
    ...prefix("utilities", [
      // Groups management
      ...prefix("groups", [
        index("./routes/modules/utilities/groups/index.tsx"),
        route(
          "/add",
          "./routes/modules/utilities/groups/add.tsx"
        ),
        route(
          ":id",
          "./routes/modules/utilities/groups/$id.tsx"
        ),
      ]),
      // Rooms management
      ...prefix("rooms", [
        index("./routes/modules/utilities/rooms/index.tsx"),
        route(
          "/create",
          "./routes/modules/utilities/rooms/create.tsx"
        ),
        route(
          ":id",
          "./routes/modules/utilities/rooms/$id.tsx"
        ),
        route(
          ":id/edit",
          "./routes/modules/utilities/rooms/$id.edit.tsx"
        ),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
