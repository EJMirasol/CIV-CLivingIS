import { redirectDocument, useNavigate } from "react-router";
import { toast } from "sonner";
import { FaTrash } from "react-icons/fa";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface DeleteConfirmationDialogProps {
  triggerText?: string;
  title?: string;
  description?: string;
  redirectPath: string;
}

export const DeleteConfirmationDialog = ({
  triggerText = "Delete",
  title = "Confirmation",
  description = "Are you sure you want to delete this item?",
  redirectPath,
}: DeleteConfirmationDialogProps) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    toast.success("Successfully deleted.");
    navigate(redirectPath);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="h-8 gap-1">
          <FaTrash className="h-5 w-auto" /> {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row items-baseline md:justify-end justify-center gap-2">
          <DialogClose className="w-[70px]" asChild>
            <Button variant="outline">No</Button>
          </DialogClose>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="w-[70px]"
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
