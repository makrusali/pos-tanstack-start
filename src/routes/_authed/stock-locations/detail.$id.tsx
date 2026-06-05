import { Button } from '#/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getStockLocationFn } from '#/lib/server/stock-locations'
import { ArrowLeft, Package, Edit, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/_authed/stock-locations/detail/$id')({
  component: StockLocationDetailComponent,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ['stock-location', params.id],
      queryFn: () => getStockLocationFn({
        data: {
          id: params.id,
        }
      }),
    })
  },
})

function StockLocationDetailComponent() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const initialData = Route.useLoaderData()

  const locationQuery = useQuery({
    queryKey: ['stock-location', id],
    queryFn: () => getStockLocationFn({
      data: {
        id,
      }
    }),
    initialData,
  })

  const location = locationQuery.data?.data

  if (locationQuery.isFetching) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!location) {
    return <div className="text-center text-destructive">Lokasi stok tidak ditemukan</div>
  }

  return (
    <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/stock-locations' })}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Detail Lokasi Stok</h2>
            <p className='text-muted-foreground'>
              Informasi lengkap tentang lokasi stok
            </p>
          </div>
        </div>
        <Button onClick={() => navigate({ to: `/stock-locations/edit/$id`, params: { id: location.id } })}>
          <Edit className='h-4 w-4 mr-2' />
          Edit Lokasi
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Informasi Lokasi
            </CardTitle>
            <CardDescription>Detail dasar lokasi stok</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>Nama Lokasi</p>
              <p className='text-lg font-semibold'>{location.name}</p>
            </div>
            {location.note && (
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Catatan</p>
                <p className='text-sm'>{location.note}</p>
              </div>
            )}
            <div>
              <p className='text-sm font-medium text-muted-foreground'>Status</p>
              <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                {location.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {location.stockProductSkus && location.stockProductSkus.length > 0 && (
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Stok di Lokasi Ini
              </CardTitle>
              <CardDescription>Daftar produk yang tersimpan di lokasi {location.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {location.stockProductSkus.map((stock: any) => (
                  <div key={stock.id} className='flex justify-between items-center p-3 border rounded-lg'>
                    <div>
                      <p className='font-medium'>{stock.productSku.product.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        SKU: {stock.productSku.name || '-'} | Unit: {stock.productSku.unit?.name || '-'}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>{Number(stock.quantity).toLocaleString()}</p>
                      <p className='text-xs text-muted-foreground'>
                        {stock.is_primary ? 'Utama' : 'Tambahan'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}