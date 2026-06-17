import { EllipsisVerticalIcon, Eye } from 'lucide-react'
import { type Row } from '@tanstack/react-table'
import { Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCustomerFn } from '#/lib/server/customers'
import { toast } from 'sonner'

type CustomerRowActionsProps<TData> = {
    row: Row<TData>
}

export function CustomerRowActions<TData>({
    row,
}: CustomerRowActionsProps<TData>) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const data = row.original as any;

    const deleteCustomer = useMutation({
        mutationFn: deleteCustomerFn,
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message || 'Customer berhasil dihapus')
                queryClient.invalidateQueries({ queryKey: ['customers'] })
                setDeleteDialogOpen(false)
            } else {
                toast.error(res.message || 'Gagal menghapus customer')
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Terjadi kesalahan saat menghapus customer')
        }
    })

    const handleView = () => {
        navigate({
            to: `/customers/detail/$id`,
            params: { id: data.id }
        })
    }

    const handleEdit = () => {
        navigate({
            to: `/customers/edit/$id`,
            params: { id: data.id }
        })
    }

    const handleDelete = () => {
        deleteCustomer.mutate({
            data: { id: data.id }
        })
    }

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                    >
                        <EllipsisVerticalIcon className='h-4 w-4' />
                        <span className='sr-only'>Buka menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem onClick={handleView} className='gap-2'>
                        <Eye className='h-4 w-4' />
                        <span>Detail</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEdit} className='gap-2'>
                        <Pencil className='h-4 w-4' />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className='gap-2 text-destructive focus:text-destructive'
                        disabled={deleteCustomer.isPending}
                    >
                        <Trash2 className='h-4 w-4' />
                        <span>{deleteCustomer.isPending ? 'Menghapus...' : 'Hapus'}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus customer "{data.name}"?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteCustomer.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            disabled={deleteCustomer.isPending}
                        >
                            {deleteCustomer.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}