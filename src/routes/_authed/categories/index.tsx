import { Button } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CategoriesTable } from './-components/categories-table'
import { useQuery } from '@tanstack/react-query'
import { getCategoriesFn } from '#/lib/server/categories'
import { CategoriesTableSkeleton } from './-components/categories-table-skeleton'

export const Route = createFileRoute('/_authed/categories/')({
  component: RouteComponent,
})

function RouteComponent() {
  const categories = useQuery({
    queryFn: getCategoriesFn,
    initialData: {
      data: [],
      success: false,
    },
    select: d => d?.data || [],
    queryKey: ['categories']
  })

  return (
    <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Kategori</h2>
          <p className='text-muted-foreground'>
            Berikut adalah daftar kategori produk Anda
          </p>
        </div>
        <Link to="/categories/add">
          <Button variant={"default"}>Tambah Kategori</Button>
        </Link>
      </div>

      {
        categories.isFetching ? <CategoriesTableSkeleton /> : <CategoriesTable data={categories.data} />
      }
    </div>
  )
}