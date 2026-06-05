import { Button } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getSettingsFn, updateSettingsFn } from '#/lib/server/settings'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { SettingsSkeleton } from './-components/settings-skeleton'

export const Route = createFileRoute('/_authed/settings/')({
  component: SettingsComponent,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ['settings'],
      queryFn: () => getSettingsFn(),
    })
  },
})

function SettingsComponent() {
  const initialData = Route.useLoaderData()

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettingsFn(),
    initialData,
  })

  const updateSettings = useMutation({
    mutationFn: updateSettingsFn,
  })

  const form = useForm({
    defaultValues: {
      store_name: settingsQuery.data?.data?.store_name || '',
      store_phone: settingsQuery.data?.data?.store_phone || '',
      store_email: settingsQuery.data?.data?.store_email || '',
      store_description: settingsQuery.data?.data?.store_description || '',
      store_address: settingsQuery.data?.data?.store_address || '',
      stock_guard: (settingsQuery.data?.data?.stock_guard || 'inactive') as 'active' | 'inactive',
      receipent_thanks_text: settingsQuery.data?.data?.receipent_thanks_text || '',
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading('Menyimpan pengaturan...')

      try {
        const res = await updateSettings.mutateAsync({
          data: value,
        })

        if (res.success) {
          toast.success('Pengaturan berhasil disimpan', { id: toastId })
        } else {
          toast.error(res.message || 'Gagal menyimpan pengaturan', { id: toastId })
        }
      } catch (err: any) {
        toast.dismiss(toastId);
        applyFormErrors(form, err)
      }
    },
  })

  if (settingsQuery.isFetching) {
    return <SettingsSkeleton />
  }

  return (
    <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Pengaturan Toko</h2>
        <p className='text-muted-foreground'>
          Kelola pengaturan umum toko Anda
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className='space-y-6'
      >
        {form.state.errorMap.onSubmit && (
          <div className="text-sm text-destructive">
            {form.state.errorMap.onSubmit}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informasi Toko</CardTitle>
            <CardDescription>
              Informasi dasar tentang toko Anda
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <form.Field
              name="store_name"
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    Nama Toko <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    placeholder="Masukkan nama toko"
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
              name="store_phone"
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    Nomor Telepon
                  </Label>
                  <Input
                    id={field.name}
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
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
              name="store_email"
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    Email Toko
                  </Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="toko@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
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
              name="store_description"
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    Deskripsi Toko
                  </Label>
                  <Textarea
                    id={field.name}
                    placeholder="Deskripsi singkat tentang toko Anda"
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
              name="store_address"
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    Alamat Toko
                  </Label>
                  <Textarea
                    id={field.name}
                    placeholder="Alamat lengkap toko Anda"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Lainnya</CardTitle>
            <CardDescription>
              Pengaturan tambahan untuk toko Anda
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <form.Field
              name="stock_guard"
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    Stock Guard
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as 'active' | 'inactive')}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Pilih status stock guard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-muted-foreground'>
                    Stock guard akan mencegah transaksi jika stok tidak mencukupi
                  </p>
                  {field.state.meta.errors.map((err) => (
                    <p key={err} className="text-sm text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            />

            <form.Field
              name="receipent_thanks_text"
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    Teks Terima Kasih (Struk)
                  </Label>
                  <Textarea
                    id={field.name}
                    placeholder="Terima kasih telah berbelanja di toko kami"
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
          </CardContent>
        </Card>

        <div className='flex gap-2'>
          <Button
            type="submit"
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
    </div>
  )
}