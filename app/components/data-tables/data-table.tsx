"use client";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type SortingState,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { DataTablePagination } from "./pagination";
import type { pagination_metadata } from "~/lib/pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: pagination_metadata;
  pageSizeOption?: number[];
  sortBy?: string;
  sortOrder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  pageSizeOption = [10, 20, 30, 40, 50],
  sortBy,
  sortOrder,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(
    sortBy && sortOrder
      ? [{ id: sortBy, desc: sortOrder === "desc" }]
      : []
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: {
        pageIndex: (pagination.pageNumber ?? 1) - 1,
        pageSize: pagination.pageSize ?? 10,
      },
    },
    pageCount: Math.ceil(
      (pagination.totalCount ?? 0) / (pagination.pageSize ?? 1)
    ),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination
          table={table}
          pagination={pagination}
          pageSizeOption={pageSizeOption}
        />
      </div>
    </>
  );
}
