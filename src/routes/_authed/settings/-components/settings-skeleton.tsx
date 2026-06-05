import { Card, CardContent, CardHeader } from "#/components/ui/card";

export function SettingsSkeleton() {
    return (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
            <div>
                <div className='h-8 w-48 animate-pulse rounded bg-muted' />
                <div className='h-4 w-64 animate-pulse rounded bg-muted mt-2' />
            </div>

            <Card>
                <CardHeader>
                    <div className='h-6 w-32 animate-pulse rounded bg-muted' />
                    <div className='h-4 w-64 animate-pulse rounded bg-muted mt-2' />
                </CardHeader>
                <CardContent className='space-y-4'>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className='space-y-2'>
                            <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                            <div className='h-10 w-full animate-pulse rounded bg-muted' />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='h-6 w-32 animate-pulse rounded bg-muted' />
                    <div className='h-4 w-64 animate-pulse rounded bg-muted mt-2' />
                </CardHeader>
                <CardContent className='space-y-4'>
                    {[1, 2].map((i) => (
                        <div key={i} className='space-y-2'>
                            <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                            <div className='h-10 w-full animate-pulse rounded bg-muted' />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className='h-10 w-32 animate-pulse rounded bg-muted' />
        </div>
    )
}