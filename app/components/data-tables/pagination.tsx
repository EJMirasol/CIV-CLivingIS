import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { p } from "node_modules/@react-router/dev/dist/routes-DHIOx0R9";
import { useNavigate, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { pagination_metadata } from "~/lib/pagination";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination?: pagination_metadata;
  pageSizeOption?: number[];
}

export function DataTablePagination<TData>({
  table,
  pagination,
  pageSizeOption = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  let navigate = useNavigate();

  const [searchParams] = useSearchParams();
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected. */}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 lg:gap-8 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={`${pagination?.pageSize || 10}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              const query = setSearchParamsString(searchParams, {
                pageSize: Number(value),
                pageNumber: 1,
              });
              navigate(`?${query}`);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOption.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-xs sm:text-sm font-medium whitespace-nowrap">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="hidden h-9 w-9 sm:h-8 sm:w-8 p-0 lg:flex"
            onClick={() => {
              table.setPageIndex(0);
              const query = setSearchParamsString(searchParams, {
                pageNumber: 1,
              });
              navigate(`?${query}`);
            }}
            disabled={(pagination?.pageNumber ?? 1) <= 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 sm:h-8 sm:w-8 p-0"
            onClick={() => {
              table.previousPage();
              const query = setSearchParamsString(searchParams, {
                pageNumber: (pagination?.pageNumber ?? 1) - 1,
              });
              navigate(`?${query}`);
            }}
            disabled={(pagination?.pageNumber ?? 1) <= 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 sm:h-8 sm:w-8 p-0"
            onClick={() => {
              table.nextPage();
              const query = setSearchParamsString(searchParams, {
                pageNumber: (pagination?.pageNumber ?? 1) + 1,
              });
              navigate(`?${query}`);
            }}
            disabled={
              (pagination?.pageNumber ?? 1) * (pagination?.pageSize ?? 10) >=
              (pagination?.totalCount ?? 0)
            }
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-9 w-9 sm:h-8 sm:w-8 p-0 lg:flex"
            onClick={() => {
              const lastPage = Math.ceil((pagination?.totalCount ?? 0) / (pagination?.pageSize ?? 10));
              table.setPageIndex(lastPage - 1);
              const query = setSearchParamsString(searchParams, {
                pageNumber: lastPage,
              });
              navigate(`?${query}`);
            }}
            disabled={
              (pagination?.pageNumber ?? 1) * (pagination?.pageSize ?? 10) >=
              (pagination?.totalCount ?? 0)
            }
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function setSearchParamsString(
  searchParams: URLSearchParams,
  changes: Record<string, string | number | undefined>
) {
  const newSearchParams = new URLSearchParams(searchParams);
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === "") {
      newSearchParams.delete(key);
      continue;
    }
    newSearchParams.set(key, String(value));
  }
  // Print string manually to avoid over-encoding the URL
  // Browsers are ok with $ nowadays
  // optional: return newSearchParams.toString()
  return Array.from(newSearchParams.entries())
    .map(([key, value]) =>
      value ? `${key}=${encodeURIComponent(value)}` : key
    )
    .join("&");
}
