import { Button } from '#/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { createStockLocationFn } from '#/lib/server/stock-locations'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
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

export const Route = createFileRoute('/_authed/stock-locations/add')({
  component: AddStockLocationComponent,
})

function AddStockLocationComponent() {
  const navigate = useNavigate()

  const createLocation = useMutation({
    mutationFn: createStockLocationFn,
  })

  const form = useForm({
    defaultValues: {
      name: '',
      note: '',
      status: 'active' as 'active' | 'inactive',
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading('Menyimpan lokasi stok...')

      try {
        const res = await createLocation.mutateAsync({
          data: value,
        })

        if (res.success) {
          toast.success(res.message, { id: toastId })
          navigate({ to: '/stock-locations' })
        } else {
          toast.error(res.message || 'Gagal menambah lokasi stok', { id: toastId })
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
          onClick={() => navigate({ to: '/stock-locations' })}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Tambah Lokasi Stok</h2>
          <p className='text-muted-foreground'>
            Isi form di bawah untuk menambahkan lokasi stok baru
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
            <div className="text-sm text-destructive">
              {form.state.errorMap.onSubmit}
            </div>
          )}

          <form.Field
            name="name"
            children={(field) => (
              <div className='space-y-2'>
                <Label htmlFor={field.name}>
                  Nama Lokasi <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="Contoh: Gudang Utama, Rak A1, Toko Cabang"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoFocus
                />
                {field.state.meta.errors.map((err) => (
                  <p key={err} className="text-sm text-destructive">
                    {err}
                  </p>
                ))}
              </div>
            )}
          />

          <form.Field
            name="note"
            children={(field) => (
              <div className='space-y-2'>
                <Label htmlFor={field.name}>
                  Catatan (Opsional)
                </Label>
                <Textarea
                  id={field.name}
                  placeholder="Masukkan catatan tambahan tentang lokasi ini"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                />
                {field.state.meta.errors.map((err) => (
                  <p key={err} className="text-sm text-destructive">
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
                  Status <span className='text-destructive'>*</span>
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
                  <p key={err} className="text-sm text-destructive">
                    {err}
                  </p>
                ))}
              </div>
            )}
          />

          <div className='flex gap-2 pt-4'>
            <Button
              type="submit"
              disabled={createLocation.isPending}
            >
              {createLocation.isPending ? 'Menyimpan...' : 'Simpan Lokasi'}
            </Button>
            <Button
              type="button"
              variant='outline'
              onClick={() => navigate({ to: '/stock-locations' })}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}