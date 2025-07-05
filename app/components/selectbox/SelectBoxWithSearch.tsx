import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

interface SelectProps {
  id: string;
  name: string;
  options: {
    id: string | number;
    name: string;
    disabled?: boolean;
  }[];
  onSelectValue?: (oldVal: string, val: string) => void;
  defaultValue?: string | number;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}


export const SelectBoxWithSearch = ({
  id,
  name,
  options,
  onSelectValue,
  defaultValue,
  disabled,
  className,
  error = false
}: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(
    defaultValue ? String(defaultValue) : ""
  );
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className={`${error ? "border-red-500" : ""}`} asChild disabled={disabled}>
          <Button
            variant="outline"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value.trim() !== ""
              ? options.find((x) => x.id === value)?.name
              : "Select..."}
            {!disabled && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command
            filter={(value, search) =>
              options
                .find((x) => x.id === value)
                ?.name.toLowerCase()
                .includes(search.toLowerCase())
                ? 1
                : 0
            }
          >
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No Options</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.name}
                    value={String(option.id)}
                    onSelect={(currentValue) => {
                      const oldVal = value;
                      setValue(currentValue === value ? "" : currentValue);
                      if (onSelectValue) {
                        onSelectValue(oldVal, currentValue);
                      }
                      setOpen(false);
                    }}
                    disabled={
                      value !== option.id
                        ? option.disabled
                          ? option.disabled
                          : false
                        : false
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input id={id} name={name} value={value} readOnly type="hidden" />
    </>
  );
};
