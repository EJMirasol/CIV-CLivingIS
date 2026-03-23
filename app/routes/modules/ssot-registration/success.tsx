import { redirect } from "react-router";
import { getToast } from "remix-toast";
import { CheckCircle, CalendarDays, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/success";

export async function loader({ request }: Route.LoaderArgs) {
  const { toast } = await getToast(request);
  if (!toast) {
    throw redirect("/ssot-registration");
  }
  return {};
}

export default function SsotRegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#15313F] text-white py-4 px-6 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-lg font-semibold">CAMANAVA SSOT 2026</h1>
          <p className="text-xs text-gray-300">&copy; All right reserved</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for registering for CAMANAVA SSOT. Your registration
              has been submitted successfully.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span>May 5-10, 2026</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>CAMANAVA Lot Amadeo</span>
              </div>
            </div>

            <Separator className="mb-6" />

            <Button
              className="bg-[#15313F] hover:bg-[#1a4352] w-full"
              onClick={() => {
                window.location.href = "/ssot-registration";
              }}
            >
              Register Another Person
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
