import { Undo2 } from "lucide-react";
import { useNavigate } from "react-router";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";



interface props {
  navigateTo?: string
  title?: string,
  description?: string
}

export function BackButton({
  navigateTo = "/",
  title = "Confirmation",
  description = "Are you sure you want to exit the page? Any changes will not be saved."
}: props) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="cursor-pointer flex items-center h-8 gap-1 border-none">
          <Undo2 className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row items-baseline md:justify-end justify-center gap-2">
          <AlertDialogCancel className="w-[70px] cursor-pointer">
            No
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleGoBack} className="w-[70px] cursor-pointer">
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
