import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn, setSearchParamsString } from "~/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  columnKey?: string;
}
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  columnKey,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const navigate = useNavigate();

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const [searchParams] = useSearchParams();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center  gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent "
            >
              <span>{title}</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDown />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp />
              ) : (
                <ChevronsUpDown />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => {
                column.toggleSorting(false);
                const query = setSearchParamsString(searchParams, {
                  sortBy: columnKey,
                  sortOrder: "asc",
                });
                navigate(`?${query}`);
              }}
            >
              <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                column.toggleSorting(true);
                const query = setSearchParamsString(searchParams, {
                  sortBy: columnKey,
                  sortOrder: "desc",
                });
                navigate(`?${query}`);
              }}
            >
              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
