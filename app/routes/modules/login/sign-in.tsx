import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Eye, EyeOff, Loader2, MessageSquareText, User } from "lucide-react";
import { toast } from "sonner";
import { Form, redirect, useActionData } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { signInSchema } from "~/lib/validations/auth";
import { useState } from "react";
import { useIsPending } from "~/hooks/use-is-pending";
import { prisma } from "~/lib/prisma";
import Logo from "/assets/CIV.png";
import { auth } from "~/lib/auth.server";
import type { Route } from "../auth/+types/sign-in";


export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (session) {
    throw redirect("/dashboard");
  }
  return null;
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const actionValue = await serverAction();

  if (!actionValue) {
    toast.error("Login failed. Please try again.");
    return null;
  }

  // Cast to any to handle the dynamic nature of server action responses
  const response = actionValue as any;

  // Check if it's an error response
  if (response.status === "error") {
    const errorResponse = response.Response;
    if (
      errorResponse?.error &&
      errorResponse.error[""] &&
      Array.isArray(errorResponse.error[""])
    ) {
      toast.error(errorResponse.error[""][0]);
    } else {
      toast.error("Login failed. Please try again.");
    }
    return response.Response;
  }

  // For successful responses or redirects, return the response as-is
  return response.Response || response;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signInSchema });

  if (submission.status !== "success") {
    return {
      status: "error",
      Response: submission.reply(),
    };
  }

  const { email, password } = submission.value;

  // Check if user exists and is active
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      status: "error",
      Response: submission.reply({
        formErrors: ["Invalid email or password."],
      }),
    };
  }

  if (!user.isActive) {
    return {
      status: "error",
      Response: submission.reply({
        formErrors: [
          "Your account has been disabled. Please contact your administrator.",
        ],
      }),
    };
  }

  if (user.loginAttempts >= 5) {
    return {
      status: "error",
      Response: submission.reply({
        formErrors: [
          "Your account has been blocked due to multiple failed attempts. Please contact your administrator.",
        ],
      }),
    };
  }

  try {
    // Use Better Auth to sign in
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email,
        password,
      },
    });

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { email },
      data: {
        loginAttempts: 0,
      },
    });

    return redirect("/dashboard", {
      headers,
    });
  } catch (error) {
    // Increment login attempts on failed login
    await prisma.user.update({
      where: { email },
      data: {
        loginAttempts: { increment: 1 },
      },
    });

    return {
      status: "error",
      Response: submission.reply({
        formErrors: ["Invalid email or password."],
      }),
    };
  }
}

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const lastResult = useActionData<typeof clientAction>();
  const isSubmitting = useIsPending("POST");

  const [form, fields] = useForm<z.infer<typeof signInSchema>>({
    lastResult: lastResult || undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signInSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-200 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0">
        <CardContent className="p-8">
          {/* Logo and Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4">
              <img
                src={Logo}
                alt="CIV Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-slate-700 text-lg font-semibold uppercase text-center mb-2">
              CIV INFORMATION SYSTEM
            </h1>
            <a className="text-green-300 font-bold hover:text-green-700 transition-colors"></a>
          </div>

          {/* Login Form */}
          <Form method="post" {...getFormProps(form)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor={fields.email.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  {...getInputProps(fields.email, { type: "email" })}
                  placeholder="Enter your email"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              {fields.email.errors && (
                <p className="text-sm text-red-600 mt-1">
                  {fields.email.errors[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor={fields.password.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  {...getInputProps(fields.password, {
                    type: showPassword ? "text" : "password",
                  })}
                  placeholder="Enter your password"
                  className="pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fields.password.errors && (
                <p className="text-sm text-red-600 mt-1">
                  {fields.password.errors[0]}
                </p>
              )}
            </div>

            {/* Form Errors */}
            {form.errors && (
              <div className="text-sm text-red-600 text-center">
                {form.errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-medium text-base mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>
        </CardContent>
      </Card>

      {/* Help Section - Outside the card */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Accordion type="single" collapsible className="w-80">
          <AccordionItem value="help" className="border-none">
            <AccordionTrigger className="text-sm text-white/80 hover:text-white py-2 justify-center">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" />
                Need help signing in?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-white/70 text-center space-y-2 pb-4">
              <p>If you're having trouble signing in:</p>
              <ul className="space-y-1 text-left">
                <li>• Make sure your email and password are correct</li>
                <li>• Check if your account is active</li>
                <li>• Contact your administrator if your account is locked</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
