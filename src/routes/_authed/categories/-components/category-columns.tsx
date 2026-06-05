import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Category } from './categories-table'
import { DataTableRowActions } from './data-table-row-actions'

export const categoryColumns: ColumnDef<Category>[] = [
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
            <DataTableColumnHeader column={column} title='Nama' />
        ),
        meta: {
            className: 'ps-1 max-w-0 w-2/3',
            tdClassName: 'ps-4',
        },
        cell: ({ row }) => {
            const category = row.original
            return (
                <div className='flex flex-col space-y-1 min-w-0'>
                    <span className='truncate font-medium'>{row.getValue('name')}</span>
                    {category.description && (
                        <span className='truncate text-xs text-muted-foreground' title={category.description}>
                            {category.description}
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
        meta: { className: 'ps-1', tdClassName: 'ps-4' },
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
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]