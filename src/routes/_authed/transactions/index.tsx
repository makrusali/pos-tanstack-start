import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTransactionsFn } from "#/lib/server/transactions";
import { TransactionTableSkeleton } from "./-components/transactions-table-skeleton";
import { TransactionsTable } from "./-components/transactions-table";

export const Route = createFileRoute("/_authed/transactions/")({
  component: TransactionsComponent,
});

function TransactionsComponent() {
  const transactions = useQuery({
    queryFn: async () => {
      const response = await getTransactionsFn();
      return response.data || [];
    },
    initialData: [],
    queryKey: ["transactions"],
  });

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Daftar Transaksi
          </h2>
          <p className="text-muted-foreground">Rekap daftar transaksi</p>
        </div>
      </div>

      {transactions.isFetching ? (
        <TransactionTableSkeleton />
      ) : (
        <TransactionsTable data={transactions.data} />
      )}
    </div>
  );
}
