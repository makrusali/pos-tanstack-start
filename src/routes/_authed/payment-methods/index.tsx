import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PaymentMethodsTableSkeleton } from "./-components/payment-methods-table-skeleton";
import { Button } from "#/components/ui/button";
import { PaymentMethodsTable } from "./-components/payment-methods-table";
import { getPaymentMethodsFn } from "#/lib/server/payment-methods";

export const Route = createFileRoute("/_authed/payment-methods/")({
  component: RouteComponent,
});

function RouteComponent() {
  const paymentMethods = useQuery({
    queryFn: getPaymentMethodsFn,
    initialData: {
      data: [],
      success: false,
    },
    select: (d) => d?.data || [],
    queryKey: ["payment-methods"],
  });

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Metode Pembayaran
          </h2>
          <p className="text-muted-foreground">Kelola metode pembayaran</p>
        </div>
        <Link to="/payment-methods/add">
          <Button variant={"default"}>Tambah Metode Pembayaran</Button>
        </Link>
      </div>

      {paymentMethods.isFetching ? (
        <PaymentMethodsTableSkeleton />
      ) : (
        <PaymentMethodsTable data={paymentMethods.data} />
      )}
    </div>
  );
}
