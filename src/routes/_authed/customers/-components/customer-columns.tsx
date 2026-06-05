import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Customer } from './customers-table'
import { CustomerRowActions } from './customer-row-actions'

export const customerColumns: ColumnDef<Customer>[] = [
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
            <DataTableColumnHeader column={column} title='Nama Customer' />
        ),
        cell: ({ row }) => {
            return (
                <div className='font-medium'>{row.getValue('name')}</div>
            )
        },
    },
    {
        accessorKey: 'contact',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Kontak' />
        ),
        cell: ({ row }) => {
            const contact = row.getValue('contact') as string
            return <div>{contact || '-'}</div>
        },
    },
    {
        accessorKey: 'address',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Alamat' />
        ),
        cell: ({ row }) => {
            const address = row.getValue('address') as string
            return <div className='max-w-md truncate'>{address || '-'}</div>
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <CustomerRowActions row={row} />,
    },
]