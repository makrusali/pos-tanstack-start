import { Button } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getUnitsFn } from '#/lib/server/units'
import { UnitsTable } from './-components/units-table'
import { UnitsTableSkeleton } from './-components/units-table-skeleton'

export const Route = createFileRoute('/_authed/units/')({
    component: UnitsComponent,
})

function UnitsComponent() {
    const units = useQuery({
        queryFn: getUnitsFn,
        initialData: {
            data: [],
            success: false,
        },
        select: d => d?.data || [],
        queryKey: ['units']
    })

    return (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
            <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Unit</h2>
                    <p className='text-muted-foreground'>
                        Kelola unit produk Anda
                    </p>
                </div>
                <Link to="/units/add">
                    <Button variant={"default"}>Tambah Unit</Button>
                </Link>
            </div>

            {
                units.isFetching ? <UnitsTableSkeleton /> : <UnitsTable data={units.data} />
            }
        </div>
    )
}