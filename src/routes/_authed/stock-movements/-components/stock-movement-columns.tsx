import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import type { StockMovement } from "./stock-movements-table";
import { Badge } from "#/components/ui/badge";
import { formatDate } from "#/lib/utils";

export const stockMovementColumns: ColumnDef<StockMovement>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => <div className="w-20">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produk" />
    ),
    cell: ({ row }) => {
      const movement = row.original;
      return (
        <div>
          <p className="font-medium">
            {movement.stockProductSku?.productSku?.product?.name || "-"}
          </p>
          <p className="text-xs text-muted-foreground">
            SKU: {movement.stockProductSku?.productSku?.name || "-"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lokasi" />
    ),
    cell: ({ row }) => {
      const movement = row.original;
      return movement.stockProductSku?.stockLocation?.name || "-";
    },
  },
  {
    accessorKey: "quantity_change",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Perubahan" />
    ),
    cell: ({ row }) => {
      const movement = row.original;
      const quantity = Number(movement.quantity);
      const type = movement.type;
      return (
        <span className={type === "in" ? "text-green-600" : "text-red-600"}>
          {type === "in" ? "+" : ""} {quantity.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "prev_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok Sebelum" />
    ),
    cell: ({ row }) => {
      const movement = row.original;
      return movement.prev_quantity.toLocaleString();
    },
  },
  {
    accessorKey: "current_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok Sesudah" />
    ),
    cell: ({ row }) => {
      const movement = row.original;
      return movement.current_quantity.toLocaleString();
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "in" ? "default" : "destructive"}>
          {type === "in" ? "Masuk" : "Keluar"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "transaction_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("transaction_date") as Date;
      return formatDate(date);
    },
  },
  {
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Referensi" />
    ),
    cell: ({ row }) => {
      const movement = row.original;
      const referenceType = movement.reference_type;
      const typeMap: Record<string, string> = {
        purchase: "Pembelian",
        sale: "Penjualan",
        adjustment: "Penyesuaian",
        transfer: "Transfer",
      };
      return (
        <div>
          <p>{typeMap[referenceType] || referenceType}</p>
          <p className="text-xs text-muted-foreground">
            ID: {movement.reference_id.slice(0, 8)}
          </p>
        </div>
      );
    },
  },
];
