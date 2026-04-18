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

  // Public SSOT Registration (no auth required)
  route("ssot-registration", "./routes/modules/ssot-registration/register.tsx"),
  route("ssot-registration/success", "./routes/modules/ssot-registration/success.tsx"),

  // Main application routes with layout - protected with authentication
  layout("./routes/_layout.tsx", [
    ...prefix("dashboard", [index("./routes/modules/dashboard/index.tsx")]),
    ...prefix("conference-meetings", [
      ...prefix("ypcl", [
        route(
          "/dashboard",
          "./routes/modules/conference-meetings/church-living/dashboard/index.tsx"
        ),
        route(
          "/registration",
          "./routes/modules/conference-meetings/church-living/index.tsx"
        ),
        route(
          "/registration/add",
          "./routes/modules/conference-meetings/church-living/register.tsx"
        ),
        route(
          "/registration/:id",
          "./routes/modules/conference-meetings/church-living/$id.tsx"
        ),
        route(
          "/export",
          "./routes/modules/conference-meetings/church-living/export.tsx"
        ),
        route(
          "/status",
          "./routes/modules/conference-meetings/church-living/status/index.tsx"
        ),
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
      ...prefix("ssot", [
        route(
          "/dashboard",
          "./routes/modules/conference-meetings/ssot/dashboard/index.tsx"
        ),
        route(
          "/registration",
          "./routes/modules/conference-meetings/ssot/index.tsx"
        ),
        route(
          "/registration/:id",
          "./routes/modules/conference-meetings/ssot/$id.tsx"
        ),
        route(
          "/export",
          "./routes/modules/conference-meetings/ssot/export.tsx"
        ),
      ]),
    ]),
    ...prefix("finance", [
      route(
        "/registration",
        "./routes/modules/finance/registration/index.tsx"
      ),
      route(
        "/registration/add",
        "./routes/modules/finance/registration/add.tsx"
      ),
      route(
        "/registration/:id",
        "./routes/modules/finance/registration/$id.tsx"
      ),
      route(
        "/statistics",
        "./routes/modules/finance/statistics/index.tsx"
      ),
      route(
        "/registrants",
        "./routes/modules/finance/registrants.ts"
      ),
      route(
        "/expenses",
        "./routes/modules/finance/expenses/index.tsx"
      ),
      route(
        "/expenses/add",
        "./routes/modules/finance/expenses/add.tsx"
      ),
      route(
        "/expenses/:id",
        "./routes/modules/finance/expenses/$id.tsx"
      ),
      route(
        "/return-changes",
        "./routes/modules/finance/return-changes/index.tsx"
      ),
      route(
        "/return-changes/add",
        "./routes/modules/finance/return-changes/add.tsx"
      ),
      route(
        "/return-changes/:id",
        "./routes/modules/finance/return-changes/$id.tsx"
      ),
    ]),
    ...prefix("utilities", [
      ...prefix("groups", [
        index("./routes/modules/utilities/groups/index.tsx"),
        route("/add", "./routes/modules/utilities/groups/add.tsx"),
        route(":id", "./routes/modules/utilities/groups/$id.tsx"),
      ]),
      ...prefix("rooms", [
        index("./routes/modules/utilities/rooms/index.tsx"),
        route("/create", "./routes/modules/utilities/rooms/create.tsx"),
        route(":id", "./routes/modules/utilities/rooms/$id.tsx"),
        route(":id/edit", "./routes/modules/utilities/rooms/$id.edit.tsx"),
      ]),
      ...prefix("billing-settings", [
        index("./routes/modules/utilities/billing-settings/index.tsx"),
        route("/add", "./routes/modules/utilities/billing-settings/add.tsx"),
        route(":id", "./routes/modules/utilities/billing-settings/$id.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
