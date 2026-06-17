import { Button } from "#/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCustomersFn } from "#/lib/server/customers";
import { CustomersTable } from "./-components/customers-table";
import { CustomersTableSkeleton } from "./-components/customers-table-skeleton";
import { wrapFn } from "#/lib/utils";

export const Route = createFileRoute("/_authed/suppliers/")({
  component: CustomersComponent,
});

function CustomersComponent() {
  const customers = useQuery({
    queryFn: () => wrapFn(getCustomersFn(), []),
    initialData: [],
    queryKey: ["customers"],
  });

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer</h2>
          <p className="text-muted-foreground">Kelola data customer Anda</p>
        </div>
        <Link to="/customers/add">
          <Button variant={"default"}>Tambah Customer</Button>
        </Link>
      </div>

      {customers.isFetching ? (
        <CustomersTableSkeleton />
      ) : (
        <CustomersTable data={customers.data} />
      )}
    </div>
  );
}
