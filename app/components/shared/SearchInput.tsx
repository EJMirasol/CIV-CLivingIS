import * as React from "react";
import { Input } from "~/components/ui/input";

interface SearchInputProps extends React.ComponentProps<typeof Input> {
  defaultValue?: string;
}

export function SearchInput({ defaultValue, ...props }: SearchInputProps) {
  const [value, setValue] = React.useState(defaultValue || "");

  React.useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
