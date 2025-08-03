import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import {
  getFormProps,
  getInputProps,
  useForm,
  type SubmissionResult,
} from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Eye, EyeOff, Loader2, MessageSquareText, User } from "lucide-react";
// import { signIn } from "~/lib/auth.client";
import { toast } from "sonner";
import { Form, Link, redirect, useActionData } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
// import { signInSchema } from "~/lib/validations/auth";
import { useState } from "react";
import { useIsPending } from "~/hooks/use-is-pending";
// import { serverAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/prisma";
// import Logo from "~/src/Logo.png";
import type { Route } from "../../+types/home";
import Logo from "~/src/CIV.png";

export async function loader({ request }: Route.LoaderArgs) {
  // const auth = serverAuth();
  // const session = await auth.api.getSession({
  //   headers: request.headers,
  // });
  // if (session) {
  //   throw redirect("/dashboard");
  // }
}

// export async function clientAction({ serverAction }: Route.ClientActionArgs) {
//   const actionValue = await serverAction();
//   if (actionValue.status === "error") {
//     const response = actionValue.Response as any;
//     if (
//       response.error &&
//       response.error[""] &&
//       Array.isArray(response.error[""])
//     ) {
//       toast.error(response.error[""][0]);
//     } else {
//       toast.error("Login failed. Please try again.");
//     }
//   }
//   return actionValue.Response;
// }

// export async function action({ request }: Route.ActionArgs) {
//   const auth = serverAuth();
//   const formData = await request.formData();
//   const submission = parseWithZod(formData, { schema: signInSchema });

//   if (submission.status !== "success") {
//     return {
//       status: "error",
//       Response: submission.reply(),
//     };
//   }

//   const { email, password } = submission.value;

//   const user = await prisma.user.findUnique({
//     where: { email },
//     include: {
//       accounts: { select: { password: true } },
//     },
//   });

//   const passwordHash = user?.accounts?.[0]?.password;
//   if (!passwordHash) {
//     return {
//       status: "error",
//       Response: submission.reply({
//         formErrors: ["Invalid email or password."],
//       }),
//     };
//   }

//   if (!user.isActive) {
//     return {
//       status: "error",
//       Response: submission.reply({
//         formErrors: [
//           "Your account has been disabled. Please contact your administrator.",
//         ],
//       }),
//     };
//   }

//   const ctx = await auth.$context;
//   const isMatch = await ctx.password.verify({ password, hash: passwordHash });

//   if (!isMatch) {
//     const updatedUser = await prisma.user.update({
//       where: { email },
//       data: {
//         loginAttempts: { increment: 1 },
//       },
//     });

//     if (updatedUser.loginAttempts >= 5) {
//       return {
//         status: "error",
//         Response: submission.reply({
//           formErrors: [
//             "Your account has been blocked due to multiple failed attempts. Please contact your administrator.",
//           ],
//         }),
//       };
//     }

//     return {
//       status: "error",
//       Response: submission.reply({
//         formErrors: ["Invalid email or password."],
//       }),
//     };
//   }
//   const { headers } = await auth.api.signInEmail({
//     returnHeaders: true,
//     body: {
//       email,
//       password,
//     },
//   });

//   await prisma.user.update({
//     where: { email },
//     data: {
//       loginAttempts: 0,
//     },
//   });

//   if (user.loginAttempts >= 5) {
//     return {
//       status: "error",
//       Response: submission.reply({
//         formErrors: [
//           "Your account has been blocked due to multiple failed attempts. Please contact your administrator.",
//         ],
//       }),
//     };
//   }

//   return redirect("/dashboard", {
//     headers,
//   });
// }

export default function SignIn() {
  // const [showPassword, setShowPassword] = useState(false);
  // // const lastResult = useActionData<typeof clientAction>();
  // const isSubmitting = useIsPending("POST");

  // const [form, fields] = useForm<z.infer<typeof signInSchema>>({
  //   // lastResult: lastResult as SubmissionResult,
  //   onValidate({ formData }) {
  //     return parseWithZod(formData, { schema: signInSchema });
  //   },
  //   shouldValidate: "onSubmit",
  //   shouldRevalidate: "onInput",
  // });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-240 left-10 w-full h-full bg-white rotate-40 -translate-x-20 z-0" />
      <div className="absolute w-full h-full opacity-80 bg-linear-200 from-(--app-primary) from-2% via-(--app-primary)  to-60% to-white  z-0" />
      <div className="absolute top-0 -left-40 w-200 h-full bg-(--app-primary) -skew-x-19 -translate-x-20 z-0" />

      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="button"
          aria-label="Chat support"
          className="bg-(--app-primary) hover:bg-(--app-primary-hover) text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          <MessageSquareText className="h-6 w-6" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-6xl mx-auto">
          <Card className="bg-(--app-login-card) border-slate-700 shadow-lg h-10/12 lg:h-7/12 mt-56">
            <CardContent className="p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 relative mb-4">
                  <img
                    src={Logo}
                    alt="CIV Logo"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-(--app-primary) text-lg font-semibold uppercase text-center">
                  CIV Information System
                </h2>
                 <div className="text-center">
                <a
                  href="/conference-meetings/ypcl/register/"
                  className="font-bold text-(--app-primary) hover:text-(--app-primary-hover)"
                >
                  REGISTER HERE!
                </a>
              </div>
              </div>

              {/* <h1 className="text-white text-2xl font-medium mb-6 text-center">
                Login to your account
              </h1> */}

              {/* <Form method="post" {...getFormProps(form)} className="space-y-4">
                <div>
                  <Input
                    {...getInputProps(fields.email, { type: "email" })}
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="bg-white border-slate-300"
                  />
                  {fields.email.errors && fields.email.errors.length > 0 && (
                    <div
                      id={fields.email.errorId}
                      className="text-red-500 text-sm"
                    >
                      {fields.email.errors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative mb-6">
                  <Input
                    {...getInputProps(fields.password, { type: "password" })}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="bg-white border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {fields.password.errors &&
                    fields.password.errors.length > 0 && (
                      <div
                        id={fields.password.errorId}
                        className="absolute left-0 -bottom-5 text-red-500 text-sm"
                      >
                        {fields.password.errors.map((err, i) => (
                          <p className="" key={i}>
                            {err}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-(--app-primary) hover:bg-(--app-primary-hover) text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "LOGIN"
                  )}
                </Button>
              </Form> */}

              {/* <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-(--app-primary) hover:text-(--app-primary-hover)"
                >
                  Forgot Password?
                </Link>
              </div> */}

              {/* <div className="mt-6 text-center">
                <a
                  href="/apply"
                  className="text-sm text-(--app-primary) hover:text-(--app-primary-hover)"
                >
                  REGISTER HERE!
                </a>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
