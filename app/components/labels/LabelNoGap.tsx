import { Label } from "../ui/label";
import { RequiredIndicator } from "./RequiredIndicator";

export function LabelNoGapRequired({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="gap-0">
      {children} <RequiredIndicator />
    </Label>
  );
}
