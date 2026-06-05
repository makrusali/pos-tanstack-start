import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Unit } from './units-table'
import { UnitRowActions } from './unit-row-actions'

export const unitColumns: ColumnDef<Unit>[] = [
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
            <DataTableColumnHeader column={column} title='Nama Unit' />
        ),
        cell: ({ row }) => {
            return (
                <div className='font-medium'>{row.getValue('name')}</div>
            )
        },
    },
    {
        accessorKey: 'type',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Tipe' />
        ),
        cell: ({ row }) => {
            const type = row.getValue('type') as string
            return (
                <div>
                    {type === 'integer' ? 'Integer (Bilangan Bulat)' : 'Decimal (Desimal)'}
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
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
        cell: ({ row }) => <UnitRowActions row={row} />,
    },
]