import { EllipsisVerticalIcon } from 'lucide-react'
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
import { deleteCategoryFn } from '#/lib/server/categories'
import { toast } from 'sonner'

type DataTableRowActionsProps<TData> = {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const data = row.original as any;

    const deleteCategory = useMutation({
        mutationFn: deleteCategoryFn,
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message || 'Kategori berhasil dihapus')
                queryClient.invalidateQueries({ queryKey: ['categories'] })
                setDeleteDialogOpen(false)
            } else {
                toast.error(res.message || 'Gagal menghapus kategori')
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Terjadi kesalahan saat menghapus kategori')
        }
    })

    const handleEdit = () => {
        navigate({
            to: `/categories/edit/$id`, params: {
                id: data.id,
            }
        })
    }

    const handleDelete = () => {
        deleteCategory.mutate({
            data: {
                id: data.id,
            },
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
                    <DropdownMenuItem
                        onClick={handleEdit}
                        className='gap-2'
                    >
                        <Pencil className='h-4 w-4' />
                        <span>Edit</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className='gap-2'
                        disabled={deleteCategory.isPending}
                    >
                        <Trash2 className='h-4 w-4 text-destructive' />
                        <span>{deleteCategory.isPending ? 'Menghapus...' : 'Hapus'}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kategori "{data.name}"?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteCategory.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className='bg-destructive text-destructive-foreground'
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}