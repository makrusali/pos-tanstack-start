import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '#/hooks/use-table-url-state'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '#/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '#/components/data-table'
import { CheckCheckIcon } from 'lucide-react'
import { unitColumns } from './unit-columns'

export type Unit = {
    id: string;
    name: string;
    type: 'integer' | 'decimal';
    status: 'active' | 'inactive';
    created_at: Date;
    updated_at: Date;
}

const route = getRouteApi('/_authed/units/')

type DataTableProps = {
    data: Unit[]
}

export function UnitsTable({ data }: DataTableProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

    const {
        globalFilter,
        onGlobalFilterChange,
        columnFilters,
        onColumnFiltersChange,
        pagination,
        onPaginationChange,
        ensurePageInRange,
    } = useTableUrlState({
        search: route.useSearch(),
        navigate: route.useNavigate(),
        pagination: { defaultPage: 1, defaultPageSize: 10 },
        globalFilter: { enabled: true, key: 'filter' },
        columnFilters: [
            { columnId: 'status', searchKey: 'status', type: 'array' },
            { columnId: 'type', searchKey: 'type', type: 'array' },
        ],
    })

    const table = useReactTable({
        data,
        columns: unitColumns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
            pagination,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        globalFilterFn: (row, _columnId, filterValue) => {
            const name = String(row.getValue('name')).toLowerCase()
            const searchValue = String(filterValue).toLowerCase()
            return name.includes(searchValue)
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onPaginationChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
    })

    const pageCount = table.getPageCount()
    useState(() => {
        ensurePageInRange(pageCount)
    })

    return (
        <div className={cn('flex flex-1 flex-col gap-4')}>
            <DataTableToolbar
                table={table}
                searchPlaceholder='Cari berdasarkan nama'
                filters={[
                    {
                        columnId: 'status',
                        title: 'Status',
                        options: [
                            { label: "Aktif", value: "active", icon: CheckCheckIcon },
                            { label: "Tidak Aktif", value: "inactive", icon: CheckCheckIcon },
                        ],
                    },
                    {
                        columnId: 'type',
                        title: 'Tipe',
                        options: [
                            { label: "Integer", value: "integer" },
                            { label: "Decimal", value: "decimal" },
                        ],
                    },
                ]}
            />
            <div className='overflow-hidden rounded-md border'>
                <Table className='min-w-xl'>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={unitColumns.length} className='h-24 text-center'>
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} className='mt-auto' />
        </div>
    )
}