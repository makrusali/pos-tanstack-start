import { Button } from '#/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { createUnitFn } from '#/lib/server/units'
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

export const Route = createFileRoute('/_authed/units/add')({
  component: AddUnitComponent,
})

function AddUnitComponent() {
  const navigate = useNavigate()

  const createUnit = useMutation({
    mutationFn: createUnitFn,
  })

  const form = useForm({
    defaultValues: {
      name: '',
      type: 'integer' as 'integer' | 'decimal',
      status: 'active' as 'active' | 'inactive',
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading('Menyimpan unit...')

      try {
        const res = await createUnit.mutateAsync({
          data: value,
        })

        if (res.success) {
          toast.success(res.message, { id: toastId })
          navigate({ to: '/units' })
        } else {
          toast.error(res.message || 'Gagal menambah unit', { id: toastId })
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
          onClick={() => navigate({ to: '/units' })}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Tambah Unit</h2>
          <p className='text-muted-foreground'>
            Isi form di bawah untuk menambahkan unit baru
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
                  Nama Unit <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="Contoh: Pcs, Kg, Meter"
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
            name="type"
            children={(field) => (
              <div className='space-y-2'>
                <Label htmlFor={field.name}>
                  Tipe Unit <span className='text-destructive'>*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as 'integer' | 'decimal')}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Pilih tipe unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="integer">Integer (Bilangan Bulat)</SelectItem>
                    <SelectItem value="decimal">Decimal (Desimal)</SelectItem>
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
              disabled={createUnit.isPending}
            >
              {createUnit.isPending ? 'Menyimpan...' : 'Simpan Unit'}
            </Button>
            <Button
              type="button"
              variant='outline'
              onClick={() => navigate({ to: '/units' })}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}