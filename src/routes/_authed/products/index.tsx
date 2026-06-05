import { Button } from "#/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProductsFn } from "#/lib/server/products";
import { ProductsTable } from "./-components/products-table";
import { ProductsTableSkeleton } from "./-components/products-table-skeleton";

export const Route = createFileRoute("/_authed/products/")({
  component: ProductsComponent,
});

function ProductsComponent() {
  const products = useQuery({
    queryFn: getProductsFn,
    initialData: {
      data: [],
      success: false,
    },
    select: (d) => d?.data || [],
    queryKey: ["products"],
  });

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produk</h2>
          <p className="text-muted-foreground">Kelola produk dan varian Anda</p>
        </div>
        <Link to="/products/add">
          <Button variant={"default"}>Tambah Produk</Button>
        </Link>
      </div>

      {products.isFetching ? (
        <ProductsTableSkeleton />
      ) : (
        <ProductsTable data={products.data} />
      )}
    </div>
  );
}
