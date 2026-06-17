import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useTableUrlState } from "#/hooks/use-table-url-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { DataTablePagination, DataTableToolbar } from "#/components/data-table";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Ban,
  SplitSquareVertical,
} from "lucide-react";
import { transactionsColumns } from "./transactions-columns";

export type Transaction = {
  id: string;
  code: string;
  cashier_name: string;
  customer_name?: string;
  date: Date;
  discount_total: number;
  price_total_before_discount: number;
  other_cost_total: number;
  grand_total: number;
  items_count: number;
  status: string;
  payment_status: string;
};

const Route = getRouteApi("/_authed/transactions/");

type DataTableProps = {
  data: Transaction[];
};

export function TransactionsTable({ data }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: Route.useSearch(),
    navigate: Route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: "filter" },
    columnFilters: [{ columnId: "status", searchKey: "status", type: "array" }],
  });

  const table = useReactTable({
    data,
    columns: transactionsColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const code = String(row.getValue("code")).toLowerCase();
      const customerName = String(row.getValue("customer_name")).toLowerCase();
      const searchValue = String(filterValue).toLowerCase();
      return code.includes(searchValue) || customerName.includes(searchValue);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  });

  const pageCount = table.getPageCount();
  useState(() => {
    ensurePageInRange(pageCount);
  });

  return (
    <div className={cn("flex flex-1 flex-col gap-4")}>
      <DataTableToolbar
        table={table}
        searchPlaceholder="Cari berdasarkan kode, kasir, dan nama pelanggan"
        filters={[
          {
            columnId: "status",
            title: "Status",
            options: [
              { label: "Draft", value: "draft", icon: FileText },
              { label: "Pending", value: "pending", icon: Clock },
              { label: "Selesai", value: "done", icon: CheckCircle },
              { label: "Dibatalkan", value: "cancelled", icon: XCircle },
            ],
          },
          {
            columnId: "payment_status",
            title: "Status Pembayaran",
            options: [
              { label: "Lunas", value: "paid", icon: CreditCard },
              { label: "Belum Dibayar", value: "unpaid", icon: Ban },
              { label: "Cicilan", value: "partial", icon: SplitSquareVertical },
            ],
          },
        ]}
      />
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-xl">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={transactionsColumns.length}
                  className="h-24 text-center"
                >
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
    </div>
  );
}
