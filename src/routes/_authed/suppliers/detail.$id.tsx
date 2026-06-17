import { Button } from "#/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCustomerFn } from "#/lib/server/customers";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Edit,
  ShoppingBag,
  Calendar,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { formatDate, formatCurrency } from "#/lib/utils";

export const Route = createFileRoute("/_authed/suppliers/detail/$id")({
  component: CustomerDetailComponent,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ["customer", params.id],
      queryFn: () =>
        getCustomerFn({
          data: {
            id: params.id,
          },
        }),
    });
  },
});

function CustomerDetailComponent() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const initialData = Route.useLoaderData();

  const customerQuery = useQuery({
    queryKey: ["customer", id],
    queryFn: () =>
      getCustomerFn({
        data: {
          id,
        },
      }),
    initialData,
  });

  const customer = customerQuery.data?.data;

  if (customerQuery.isFetching) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center text-destructive">
        Customer tidak ditemukan
      </div>
    );
  }

  const getTransactionStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "secondary",
      done: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/customers" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Detail Customer
            </h2>
            <p className="text-muted-foreground">
              Informasi lengkap tentang customer
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            navigate({ to: `/customers/edit/$id`, params: { id: customer.id } })
          }
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Customer</CardTitle>
            <CardDescription>Detail dasar customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nama Customer
              </p>
              <p className="text-lg font-semibold">{customer.name}</p>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{customer.email}</p>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nomor Telepon
                  </p>
                  <p>{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Alamat
                  </p>
                  <p className="text-sm">{customer.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
            <CardDescription>Waktu pendaftaran dan aktivitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Terdaftar sejak
                </p>
                <p className="text-sm">{formatDate(customer.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {customer.transactions && customer.transactions.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Riwayat Transaksi
              </CardTitle>
              <CardDescription>
                10 transaksi terakhir customer ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customer.transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Transaksi #{transaction.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(transaction.grand_total)}
                      </p>
                      {getTransactionStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
