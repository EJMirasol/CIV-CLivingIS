import { type RouteConfig, index,   route,
  layout } from "@react-router/dev/routes";

export default [
  layout("./routes/modules/registration-form/_layout.tsx", [
    route("/register", "./routes/modules/registration-form/register.tsx"),
  ]),

] satisfies RouteConfig;
