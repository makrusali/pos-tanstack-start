import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import type { Product } from "./products-table";
import { ProductRowActions } from "./product-row-actions";
import { Badge } from "#/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { cn } from "#/lib/utils";

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => <div className="w-20">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "sku_image_path",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gambar Produk" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return product.sku_image_path ? (
        <img
          className="w-12 h-12 object-contain object-center"
          src={product.sku_image_path}
        />
      ) : (
        <div className="w-12 h-12 bg-gray-300 flex items-center justify-center">
          <ImageIcon className="text-muted-foreground" />
        </div>
      );
    },
  },
  {
    accessorKey: "display_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-col space-y-1">
          <span className="font-medium">{product.display_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipe" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "item" ? "default" : "secondary"}>
          {type === "item" ? "Barang" : "Layanan"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return `Rp ${product.price.toLocaleString("id-ID")}`;
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div>
          <div className="font-medium">
            Total Stock: {product.stock_quantity.toLocaleString("id-ID")}
          </div>

          <ul className="mt-1 space-y-1">
            {product.stock_locations.map((sl) => (
              <li
                className={cn(
                  "w-fit bg-primary text-accent-foreground py-1 px-2 rounded-md text-xs",
                  {
                    "border border-primary bg-primary text-primary-foreground":
                      sl.is_primary,
                    "border border-primary bg-gray-50 text-black":
                      !sl.is_primary,
                  },
                )}
              >
                {sl.name} ({sl.quantity})
              </li>
            ))}
          </ul>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions row={row} />,
  },
];
