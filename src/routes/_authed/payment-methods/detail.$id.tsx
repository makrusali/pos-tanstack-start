import { Button } from "#/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPaymentMethodFn } from "#/lib/server/payment-methods";
import {
  ArrowLeft,
  CreditCard,
  Tag,
  Image as ImageIcon,
  Calendar,
  Clock,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { formatDate } from "#/lib/utils";

export const Route = createFileRoute("/_authed/payment-methods/detail/$id")({
  component: PaymentMethodDetailComponent,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ["payment-method", params.id],
      queryFn: () =>
        getPaymentMethodFn({
          data: {
            id: params.id,
          },
        }),
    });
  },
});

function PaymentMethodDetailComponent() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const initialData = Route.useLoaderData();

  const { data: paymentMethodData, isLoading } = useQuery({
    queryKey: ["payment-method", id],
    queryFn: () =>
      getPaymentMethodFn({
        data: {
          id,
        },
      }),
    initialData,
  });

  const paymentMethod = paymentMethodData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Memuat data metode pembayaran...
          </p>
        </div>
      </div>
    );
  }

  if (!paymentMethod) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-destructive">Metode pembayaran tidak ditemukan</p>
        <Button onClick={() => navigate({ to: "/payment-methods" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Metode Pembayaran
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/payment-methods" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Detail Metode Pembayaran
          </h2>
          <p className="text-muted-foreground">
            Informasi lengkap tentang metode pembayaran
          </p>
        </div>
      </div>

      {/* Payment Method Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                {paymentMethod.name}
              </CardTitle>
              <CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    variant={
                      paymentMethod.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {paymentMethod.status === "active" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Nonaktif
                      </>
                    )}
                  </Badge>
                </div>
              </CardDescription>
            </div>
            {paymentMethod.image_path && (
              <div className="flex-shrink-0">
                <img
                  src={paymentMethod.image_path}
                  alt={paymentMethod.name}
                  className="w-16 h-16 object-contain rounded-lg border bg-white p-2"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description Section */}
          {paymentMethod.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Deskripsi
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {paymentMethod.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dibuat:</span>
              <span>{formatDate(paymentMethod.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Diperbarui:</span>
              <span>{formatDate(paymentMethod.updated_at)}</span>
            </div>
          </div>

          {/* Status Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Status Card */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              {paymentMethod.status === "active" ? (
                <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
              ) : (
                <XCircle className="h-6 w-6 mx-auto text-red-500 mb-2" />
              )}
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-base font-semibold">
                {paymentMethod.status === "active" ? "Aktif" : "Nonaktif"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {paymentMethod.status === "active"
                  ? "Metode pembayaran ini dapat digunakan oleh pelanggan"
                  : "Metode pembayaran ini sedang tidak aktif"}
              </p>
            </div>
          </div>

          {/* Image Section if exists */}
          {paymentMethod.image_path && (
            <div className="pt-4 border-t">
              <h5 className="font-medium flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4" />
                Gambar / Logo
              </h5>
              <div className="flex justify-center p-4 bg-muted/30 rounded-lg border">
                <img
                  src={paymentMethod.image_path}
                  alt={paymentMethod.name}
                  className="max-w-full max-h-48 object-contain rounded-lg bg-white"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 sticky bottom-0 bg-background py-4 border-t">
        <Button
          onClick={() =>
            navigate({ to: `/payment-methods/edit/${paymentMethod.id}` })
          }
        >
          Edit Metode Pembayaran
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: "/payment-methods" })}
        >
          Kembali ke Daftar
        </Button>
      </div>
    </div>
  );
}
