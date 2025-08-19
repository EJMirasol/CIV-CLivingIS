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
    ...prefix("dashboard", [
      index("./routes/modules/dashboard/index.tsx")
    ]),
    ...prefix("conference-meetings", [
      ...prefix("ypcl", [
        // Church living index - requires authentication
        index("./routes/modules/conference-meetings/church-living/index.tsx"),
        // Registration form - requires authentication
        route("/register", "./routes/modules/conference-meetings/church-living/register.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
