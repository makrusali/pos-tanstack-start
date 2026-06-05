import { Button } from '#/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { createCategoryFn } from '#/lib/server/categories'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '#/components/ui/select'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { applyFormErrors } from '#/lib/utils'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_authed/categories/add')({
    component: AddCategoryComponent,
})

function AddCategoryComponent() {
    const navigate = useNavigate()

    const createCategory = useMutation({
        mutationFn: createCategoryFn,
    })

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            status: 'active' as 'active' | 'inactive',
        },
        onSubmit: async ({ value }) => {
            const toastId = toast.loading('Menyimpan kategori...')

            try {
                const res = await createCategory.mutateAsync({
                    data: value,
                })

                if (res.success) {
                    toast.success(res.message, { id: toastId })
                    navigate({ to: '/categories' })
                } else {
                    toast.error(res.message || 'Gagal menambah kategori', { id: toastId })
                }
            } catch (err: any) {
                toast.dismiss(toastId);
                applyFormErrors(form, err)
            }
        },
    })

    return (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
            <div className='flex items-center gap-4'>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: '/categories' })}
                >
                    <ArrowLeft className='h-4 w-4' />
                </Button>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Tambah Kategori</h2>
                    <p className='text-muted-foreground'>
                        Isi form di bawah untuk menambahkan kategori produk baru
                    </p>
                </div>
            </div>

            <div className='max-w-md'>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className='space-y-4'
                >
                    {form.state.errorMap.onSubmit && (
                        <div className="text-sm text-red-500">
                            {form.state.errorMap.onSubmit}
                        </div>
                    )}

                    <form.Field
                        name="name"
                        children={(field) => (
                            <div className='space-y-2'>
                                <Label htmlFor={field.name}>
                                    Nama Kategori <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    id={field.name}
                                    type="text"
                                    placeholder="Contoh: Elektronik, Pakaian, Makanan"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    autoFocus
                                />
                                {field.state.meta.errors.map((err) => (
                                    <p key={err} className="text-sm text-red-500">
                                        {err}
                                    </p>
                                ))}
                            </div>
                        )}
                    />

                    <form.Field
                        name="description"
                        children={(field) => (
                            <div className='space-y-2'>
                                <Label htmlFor={field.name}>
                                    Deskripsi (Opsional)
                                </Label>
                                <Input
                                    id={field.name}
                                    type="text"
                                    placeholder="Masukkan deskripsi kategori"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((err) => (
                                    <p key={err} className="text-sm text-red-500">
                                        {err}
                                    </p>
                                ))}
                            </div>
                        )}
                    />

                    <form.Field
                        name="status"
                        children={(field) => (
                            <div className='space-y-2'>
                                <Label htmlFor={field.name}>
                                    Status <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value as 'active' | 'inactive')}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.map((err) => (
                                    <p key={err} className="text-sm text-red-500">
                                        {err}
                                    </p>
                                ))}
                            </div>
                        )}
                    />

                    <div className='flex gap-2 pt-4'>
                        <Button
                            type="submit"
                            disabled={createCategory.isPending}
                        >
                            {createCategory.isPending ? 'Menyimpan...' : 'Simpan Kategori'}
                        </Button>
                        <Button
                            type="button"
                            variant='outline'
                            onClick={() => navigate({ to: '/categories' })}
                        >
                            Batal
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}