import { IoMdSend } from "react-icons/io";

import { Button } from "../../ui/button";
import { useIsPending } from "~/hooks/use-is-pending";

interface props {
  formId: string;
}

export const SubmitButton = ({ formId }: props) => {
  const isSubmitting = useIsPending("POST");

  return (
    <Button
      form={formId}
      type="submit"
      variant="view"
      size="sm"
      className="h-8 gap-1"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="animate-spin mr-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
          Submitting...
        </>
      ) : (
        <>
          <IoMdSend className="w-4 h-4 mr-1" />
          Submit
        </>
      )}
    </Button>
  );
};
