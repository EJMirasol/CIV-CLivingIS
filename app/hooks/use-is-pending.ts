import { useNavigation } from "react-router";

type FormMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export function useIsPending(formMethod?: FormMethod) {
  const navigation = useNavigation();
  const isPending = navigation.state === "submitting";

  if (!formMethod) {
    return isPending;
  }

  return (
    isPending &&
    navigation.formMethod?.toUpperCase() === formMethod.toUpperCase()
  );
}
