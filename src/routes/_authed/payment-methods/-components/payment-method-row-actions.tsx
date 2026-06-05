import { EllipsisVerticalIcon, Eye } from "lucide-react";
import { type Row } from "@tanstack/react-table";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePaymentMethodFn } from "#/lib/server/payment-methods";
import { toast } from "sonner";
import { applyFormErrors } from "#/lib/utils";

type PaymentMethodRowActionsProps<TData> = {
  row: Row<TData>;
};

export function PaymentMethodRowActions<TData>({
  row,
}: PaymentMethodRowActionsProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const data = row.original as any;

  const deletePaymentMethod = useMutation({
    mutationFn: deletePaymentMethodFn,
    onSuccess: (res) => {
      console.log({ res });
      if (res.success) {
        toast.success(res.message || "Metode pembayaran berhasil dihapus");
        queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
        setDeleteDialogOpen(false);
      } else {
        toast.error(res.message || "Gagal menghapus metode pembayaran");
      }
    },
    onError: (error: any) => {
      applyFormErrors(null, error);
    },
  });

  const handleView = () => {
    navigate({
      to: `/payment-methods/detail/$id`,
      params: { id: data.id },
    });
  };

  const handleEdit = () => {
    navigate({
      to: `/payment-methods/edit/$id`,
      params: { id: data.id },
    });
  };

  const handleDelete = () => {
    deletePaymentMethod.mutate({
      data: { id: data.id },
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
          <DropdownMenuItem onClick={handleEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2 text-destructive focus:text-destructive"
            disabled={deletePaymentMethod.isPending}
          >
            <Trash2 className="h-4 w-4" />
            <span>
              {deletePaymentMethod.isPending ? "Menghapus..." : "Hapus"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Metode Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus metode pembayaran "{data.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePaymentMethod.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePaymentMethod.isPending}
            >
              {deletePaymentMethod.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
