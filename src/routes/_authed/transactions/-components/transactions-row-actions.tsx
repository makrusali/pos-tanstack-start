import { EllipsisVerticalIcon, Eye } from "lucide-react";
import { type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "@tanstack/react-router";

type StockLocationRowActionsProps<TData> = {
  row: Row<TData>;
};

export function TransactionsRowActions<TData>({
  row,
}: StockLocationRowActionsProps<TData>) {
  const navigate = useNavigate();
  const data = row.original as any;

  const handleView = () => {
    navigate({
      to: `/transactions/detail/$id`,
      params: { id: data.id },
    });
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
            <span className="sr-only">Buka menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView} className="gap-2">
            <Eye className="h-4 w-4" />
            <span>Detail</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
