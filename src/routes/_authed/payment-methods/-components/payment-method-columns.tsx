import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { PaymentMethodRowActions } from "./payment-method-row-actions";
import { Badge } from "#/components/ui/badge";
import { ImageIcon } from "lucide-react";
import type { PaymentMethod } from "./payment-methods-table";

export const paymentMethodColumns: ColumnDef<PaymentMethod>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => <div className="w-20">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image_path",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gambar" />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.original;
      return paymentMethod.image_path ? (
        <img
          className="w-12 h-12 object-contain object-center"
          src={paymentMethod.image_path}
        />
      ) : (
        <div className="w-12 h-12 bg-gray-300 flex items-center justify-center">
          <ImageIcon className="text-muted-foreground" />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk" />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.original;
      return (
        <div className="flex flex-col space-y-1">
          <span className="font-medium">{paymentMethod.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipe" />
    ),
    cell: ({ row }) => {
      const state = row.original.status;
      return (
        <Badge variant={state === "active" ? "default" : "secondary"}>
          {state === "active" ? "Aktif" : "Tidak Aktif"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PaymentMethodRowActions row={row} />,
  },
];
