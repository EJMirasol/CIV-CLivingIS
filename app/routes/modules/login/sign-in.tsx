import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Eye, EyeOff, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Form, redirect, useActionData } from "react-router";
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a2e29] via-[#213b36] to-[#1a2e29] flex items-center justify-center p-4">
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <CardContent className="p-8 space-y-6">
          {/* Logo and Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#213b36] to-[#2c4f48] rounded-2xl flex items-center justify-center shadow-lg">
              <img
                src={Logo}
                alt="CIV Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#213b36] tracking-wide uppercase">
                CIV Information System
              </h1>
              <p className="text-sm text-gray-500">
                Secure access to Church management
              </p>
            </div>
          </div>

          {/* Login Form */}
          <Form method="post" {...getFormProps(form)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor={fields.email.id}
                className="text-sm font-medium text-gray-700 block"
              >
                Email Address
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-[#213b36] transition-colors" />
                <Input
                  {...getInputProps(fields.email, { type: "email" })}
                  placeholder="Enter your email"
                  className="pl-10 h-10 border-gray-200 focus:border-[#213b36] transition-all"
                  disabled={isSubmitting}
                />
              </div>
              {fields.email.errors && (
                <p className="text-sm text-red-600 animate-in fade-in-0 duration-200">
                  {fields.email.errors[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor={fields.password.id}
                className="text-sm font-medium text-gray-700 block"
              >
                Password
              </label>
              <div className="relative group">
                <Input
                  {...getInputProps(fields.password, {
                    type: showPassword ? "text" : "password",
                  })}
                  placeholder="Enter your password"
                  className="pr-10 h-10 border-gray-200 focus:border-[#213b36] transition-all"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#213b36] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                <p className="text-sm text-red-600 animate-in fade-in-0 duration-200">
                  {fields.password.errors[0]}
                </p>
              )}
            </div>

            {/* Form Errors */}
            {form.errors && (
              <div className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                {form.errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-[#213b36] hover:bg-[#2c4f48] text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
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
    </div>
  );
}
