import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import type { Customer } from "./customers-table";
import { CustomerRowActions } from "./customer-row-actions";

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => <div className="w-20">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Customer" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "contact",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kontak" />
    ),
    cell: ({ row }) => {
      const email = row.original.email;
      const phone = row.original.phone;

      if (!email && !phone) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          {email && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                Email:
              </span>
              <span className="text-sm">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                Phone:
              </span>
              <a
                href={`https://wa.me/${phone.replace(/^\+/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                {phone}
              </a>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat" />
    ),
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return <div className="max-w-md truncate">{address || "-"}</div>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CustomerRowActions row={row} />,
  },
];
