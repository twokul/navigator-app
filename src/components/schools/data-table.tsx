"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  DataTableFacetedFilter,
  FacetedFilterOption,
} from "@/components/schools/data-table-faceted-filter";
import { School } from "@/components/schools/columns";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  statusOptions?: FacetedFilterOption[];
  programOptions?: FacetedFilterOption[];
  stateOptions?: FacetedFilterOption[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  statusOptions = [],
  programOptions = [],
  stateOptions = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [programFilter, setProgramFilter] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string[]>([]);

  // Filter data based on status, program, and state filters
  const filteredData = useMemo(() => {
    return data.filter((item: TData) => {
      // Filter by status
      if (statusFilter.length > 0) {
        const hasMatchingStatus = (item as School).status?.some((status: string) =>
          statusFilter.includes(status),
        );
        if (!hasMatchingStatus) return false;
      }

      // Filter by programs
      if (programFilter.length > 0) {
        const hasMatchingProgram = (item as School).programs?.some((program: string) =>
          programFilter.includes(program),
        );
        if (!hasMatchingProgram) return false;
      }

      // Filter by state
      if (stateFilter.length > 0) {
        const hasMatchingState = stateFilter.includes((item as School).state);
        if (!hasMatchingState) return false;
      }

      return true;
    });
  }, [data, statusFilter, programFilter, stateFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 py-4">
        <Input
          placeholder="Filter schools..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          {stateOptions.length > 0 && (
            <DataTableFacetedFilter
              title="State"
              options={stateOptions}
              selectedValues={stateFilter}
              onSelectedValuesChange={setStateFilter}
            />
          )}
          {statusOptions.length > 0 && (
            <DataTableFacetedFilter
              title="Status"
              options={statusOptions}
              selectedValues={statusFilter}
              onSelectedValuesChange={setStatusFilter}
            />
          )}
          {programOptions.length > 0 && (
            <DataTableFacetedFilter
              title="Programs"
              options={programOptions}
              selectedValues={programFilter}
              onSelectedValuesChange={setProgramFilter}
            />
          )}
        </div>
      </div>
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border-input bg-background h-8 w-[70px] rounded border px-3 py-1 text-sm"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
