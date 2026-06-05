import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import type { StockLocation } from './stock-locations-table'
import { StockLocationRowActions } from './stock-location-row-actions'

export const stockLocationColumns: ColumnDef<StockLocation>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='#' />
        ),
        cell: ({ row }) => <div className='w-20'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Nama Lokasi' />
        ),
        cell: ({ row }) => {
            const location = row.original
            return (
                <div className='flex flex-col space-y-1 min-w-0'>
                    <span className='font-medium'>{row.getValue('name')}</span>
                    {location.note && (
                        <span className='text-xs text-muted-foreground'>
                            {location.note}
                        </span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <div className='flex w-25 items-center gap-2'>
                    <span className={status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <StockLocationRowActions row={row} />,
    },
]