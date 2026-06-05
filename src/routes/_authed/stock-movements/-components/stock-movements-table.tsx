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
import { stockMovementColumns } from './stock-movement-columns'

export type StockMovement = {
    id: string;
    reference_type: string;
    reference_id: string;
    prev_quantity: number;
    quantity: number;
    current_quantity: number;
    type: 'in' | 'out';
    transaction_date: Date;
    note: string | null;
    stockProductSku: {
        productSku: {
            product: {
                name: string;
            };
            name: string | null;
            unit: {
                name: string;
            } | null;
        };
        stockLocation: {
            name: string;
        };
    };
}

const route = getRouteApi('/_authed/stock-movements/')

type DataTableProps = {
    data: StockMovement[]
}

export function StockMovementsTable({ data }: DataTableProps) {
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
            { columnId: 'type', searchKey: 'movement_type', type: 'array' },
        ],
    })

    const table = useReactTable({
        data,
        columns: stockMovementColumns,
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
            const product = String(row.original.stockProductSku?.productSku?.product?.name || '').toLowerCase()
            const location = String(row.original.stockProductSku?.stockLocation?.name || '').toLowerCase()
            const searchValue = String(filterValue).toLowerCase()
            return product.includes(searchValue) || location.includes(searchValue)
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
                searchPlaceholder='Cari berdasarkan produk atau lokasi'
                filters={[
                    {
                        columnId: 'type',
                        title: 'Jenis Pergerakan',
                        options: [
                            { label: "Masuk", value: "in" },
                            { label: "Keluar", value: "out" },
                        ],
                    },
                ]}
            />
            <div className='overflow-hidden rounded-md border'>
                <Table>
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
                                <TableCell colSpan={stockMovementColumns.length} className='h-24 text-center'>
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