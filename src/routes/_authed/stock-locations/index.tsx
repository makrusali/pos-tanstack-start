import { Button } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getStockLocationsFn } from '#/lib/server/stock-locations'
import { StockLocationsTable } from './-components/stock-locations-table'
import { StockLocationsTableSkeleton } from './-components/stock-locations-table-skeleton'

export const Route = createFileRoute('/_authed/stock-locations/')({
  component: StockLocationsComponent,
})

function StockLocationsComponent() {
  const locations = useQuery({
    queryFn: getStockLocationsFn,
    initialData: {
      data: [],
      success: false,
    },
    select: d => d?.data || [],
    queryKey: ['stock-locations']
  })

  return (
    <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Lokasi Stok</h2>
          <p className='text-muted-foreground'>
            Kelola lokasi penyimpanan stok Anda
          </p>
        </div>
        <Link to="/stock-locations/add">
          <Button variant={"default"}>Tambah Lokasi</Button>
        </Link>
      </div>

      {
        locations.isFetching ? <StockLocationsTableSkeleton /> : <StockLocationsTable data={locations.data} />
      }
    </div>
  )
}