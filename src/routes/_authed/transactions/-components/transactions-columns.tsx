import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import type { Transaction } from "./transactions-table";
import { TransactionsRowActions } from "./transactions-row-actions";
import { formatCurrencyIDR, formatDateTime } from "#/lib/utils";

export const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => (
      <div className="w-20 text-gray-500">{row.index + 1}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Transaksi" />
    ),
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <div className="flex flex-col space-y-1 min-w-0">
          <span className="font-medium text-blue-600">
            #{row.getValue("code")}
          </span>
          {transaction.cashier_name && (
            <span className="text-xs text-gray-500">
              Kasir: {transaction.cashier_name}
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pelanggan" />
    ),
    cell: ({ row }) => {
      const customerName = row.getValue("customer_name") as string | null;
      return customerName || "Pelanggan Umum";
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      const date = row.getValue<Date>("date");
      return formatDateTime(date);
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue<Date>(id).toString());
    },
  },
  {
    accessorKey: "items_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah Item" />
    ),
    cell: ({ row }) => {
      const itemsCount = row.getValue("items_count") as number;
      return (
        <div className="text-center">
          <span className="inline-flex px-2 py-1 text-sm font-medium rounded-md bg-gray-100 text-blue-600">
            {itemsCount}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "price_total_before_discount",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Subtotal (Sebelum Diskon)"
      />
    ),
    cell: ({ row }) => {
      const priceTotal = row.getValue("price_total_before_discount") as number;
      return formatCurrencyIDR(priceTotal);
    },
  },
  {
    accessorKey: "other_cost_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total biaya lain" />
    ),
    cell: ({ row }) => {
      const priceTotal = row.getValue("other_cost_total") as number;
      return formatCurrencyIDR(priceTotal);
    },
  },
  {
    accessorKey: "discount_total",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diskon" />
    ),
    cell: ({ row }) => {
      const discountTotal = row.getValue("discount_total") as number;
      return (
        <span className="text-green-600">
          -{formatCurrencyIDR(discountTotal)}
        </span>
      );
    },
  },
  {
    accessorKey: "grand_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Final" />
    ),
    cell: ({ row }) => {
      const grandTotal = row.getValue("grand_total") as number;
      return (
        <span className="font-semibold">{formatCurrencyIDR(grandTotal)}</span>
      );
    },
  },
  {
    accessorKey: "status",
    enableSorting: false,

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status === "draft") {
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Draft
          </span>
        );
      } else if (status === "done") {
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Selesai
          </span>
        );
      } else if (status === "cancelled") {
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Dibatalkan
          </span>
        );
      } else {
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status || "-"}
          </span>
        );
      }
    },
  },
  {
    accessorKey: "payment_status",
    enableSorting: false,

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran" />
    ),
    cell: ({ row }) => {
      const paymentStatus = row.getValue("payment_status") as string;
      if (paymentStatus === "paid") {
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Lunas
          </span>
        );
      } else if (paymentStatus === "pending") {
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      } else {
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Belum Bayar
          </span>
        );
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TransactionsRowActions row={row} />,
  },
];
