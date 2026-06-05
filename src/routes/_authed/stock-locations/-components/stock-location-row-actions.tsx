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
import { deleteStockLocationFn } from '#/lib/server/stock-locations'
import { toast } from 'sonner'

type StockLocationRowActionsProps<TData> = {
    row: Row<TData>
}

export function StockLocationRowActions<TData>({
    row,
}: StockLocationRowActionsProps<TData>) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const data = row.original as any;

    const deleteLocation = useMutation({
        mutationFn: deleteStockLocationFn,
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message || 'Lokasi stok berhasil dihapus')
                queryClient.invalidateQueries({ queryKey: ['stock-locations'] })
                setDeleteDialogOpen(false)
            } else {
                toast.error(res.message || 'Gagal menghapus lokasi stok')
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Terjadi kesalahan saat menghapus lokasi stok')
        }
    })

    const handleView = () => {
        navigate({
            to: `/stock-locations/detail/$id`,
            params: { id: data.id }
        })
    }

    const handleEdit = () => {
        navigate({
            to: `/stock-locations/edit/$id`,
            params: { id: data.id }
        })
    }

    const handleDelete = () => {
        deleteLocation.mutate({
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
                        disabled={deleteLocation.isPending}
                    >
                        <Trash2 className='h-4 w-4' />
                        <span>{deleteLocation.isPending ? 'Menghapus...' : 'Hapus'}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Lokasi Stok?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus lokasi stok "{data.name}"?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLocation.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            disabled={deleteLocation.isPending}
                        >
                            {deleteLocation.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}