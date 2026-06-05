import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";

export function StockLocationsTableSkeleton() {
    return (
        <div className='flex flex-1 flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
                <div className='h-10 w-64 animate-pulse rounded-md bg-muted' />
                <div className='h-10 w-32 animate-pulse rounded-md bg-muted' />
            </div>

            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[1, 2, 3].map((i) => (
                                <TableHead key={i}>
                                    <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((row) => (
                            <TableRow key={row}>
                                {[1, 2, 3].map((cell) => (
                                    <TableCell key={cell}>
                                        <div className='h-4 w-full animate-pulse rounded bg-muted' />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className='flex items-center justify-end gap-2'>
                <div className='h-8 w-24 animate-pulse rounded bg-muted' />
                <div className='h-8 w-8 animate-pulse rounded bg-muted' />
                <div className='h-8 w-8 animate-pulse rounded bg-muted' />
            </div>
        </div>
    )
}