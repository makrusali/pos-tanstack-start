import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getStockMovementsFn } from '#/lib/server/stock-movements'
import { StockMovementsTable } from './-components/stock-movements-table'
import { StockMovementsTableSkeleton } from './-components/stock-movements-table-skeleton'

export const Route = createFileRoute('/_authed/stock-movements/')({
    component: StockMovementsComponent,
})

function StockMovementsComponent() {
    const movements = useQuery({
        queryFn: getStockMovementsFn,
        initialData: {
            data: [],
            success: false,
        },
        select: d => d?.data || [],
        queryKey: ['stock-movements']
    })

    return (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
            <div>
                <h2 className='text-2xl font-bold tracking-tight'>Riwayat Pergerakan Stok</h2>
                <p className='text-muted-foreground'>
                    Catatan semua pergerakan stok barang
                </p>
            </div>

            {
                movements.isFetching ? <StockMovementsTableSkeleton /> : <StockMovementsTable data={movements.data} />
            }
        </div>
    )
}