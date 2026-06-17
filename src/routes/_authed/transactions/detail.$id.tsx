import { Button } from "#/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  Edit,
  User,
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  MapPin,
  Layers,
  Store,
  Tag,
  Plus,
  Printer,
  ReceiptText,
  Coins,
} from "lucide-react";
import { Badge } from "#/components/ui/badge";
import {
  generateTransactionReceiptFn,
  getTransactionFn,
} from "#/lib/server/transactions";
import {
  cn,
  formatCurrencyIDR,
  formatDateTime,
  formatDecimal,
  wrapFn,
} from "#/lib/utils";
import { getPaymentMethodsFn } from "#/lib/server/pos";
import { AddPaymentDialog } from "./-components/add-payment-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";

export const Route = createFileRoute("/_authed/transactions/detail/$id")({
  component: TransactionDetailComponent,
  loader: async ({ params, context: { queryClient } }) => {
    const transaction = await queryClient.ensureQueryData({
      queryKey: ["transactions", params.id],
      queryFn: () =>
        wrapFn(
          getTransactionFn({
            data: {
              id: params.id,
            },
          }),
          null,
        ),
    });

    const paymentMethods = await queryClient.ensureQueryData({
      queryKey: ["payment-emthods"],
      queryFn: () => wrapFn(getPaymentMethodsFn(), []),
    });

    return {
      transaction,
      paymentMethods,
    };
  },
});

function TransactionDetailComponent() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { transaction: initialData } = Route.useLoaderData();

  const getTransaction = useQuery({
    queryKey: ["transactions", id],
    queryFn: () =>
      wrapFn(
        getTransactionFn({
          data: {
            id: id,
          },
        }),
        null,
      ),
    initialData,
  });

  const postGenerateReceipt = useMutation({
    mutationFn: () =>
      wrapFn(
        generateTransactionReceiptFn({
          data: {
            id: id,
          },
        }),
        null,
      ),
  });

  const transaction = getTransaction.data;

  if (getTransaction.isFetching) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (transaction === null) {
    return (
      <div className="text-center text-destructive">
        Transaksi tidak ditemukan
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        label: "Draft",
        icon: FileText,
        className: "bg-muted/50 text-muted-foreground",
      },
      pending: {
        label: "Pending",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-700",
      },
      done: {
        label: "Selesai",
        icon: CheckCircle,
        className: "bg-green-100 text-green-700",
      },
      cancelled: {
        label: "Dibatalkan",
        icon: XCircle,
        className: "bg-red-100 text-red-700",
      },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      paid: {
        label: "Lunas",
        icon: CheckCircle,
        className: "bg-green-100 text-green-700",
      },
      unpaid: {
        label: "Belum Dibayar",
        icon: AlertCircle,
        className: "bg-yellow-100 text-yellow-700",
      },
      partial: {
        label: "Cicilan",
        icon: Clock,
        className: "bg-blue-100 text-blue-700",
      },
    };
    return configs[status as keyof typeof configs] || configs.unpaid;
  };

  const statusConfig = getStatusConfig(transaction.status);
  const paymentStatusConfig = getPaymentStatusConfig(
    transaction.payment_status,
  );

  const handleGenerateReceipt = () => {
    postGenerateReceipt.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.bytes && data?.filename) {
          const filename = data.filename;
          const bytes = data.bytes;
          const blob = new Blob([new Uint8Array(bytes)], {
            type: "application/pdf",
          });

          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();

          URL.revokeObjectURL(url);
        }
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/transactions" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Detail Transaksi
            </h2>
            <p className="text-muted-foreground">
              Informasi lengkap tentang transaksi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={postGenerateReceipt.isPending}
            onClick={handleGenerateReceipt}
          >
            <Printer className="h-4 w-4 mr-2" />
            Generate Struk
          </Button>
          <AddPaymentDialog
            disabled={transaction.payment_status === "paid"}
            Trigger={
              <Tooltip>
                <TooltipTrigger>
                  <Button disabled={transaction.payment_status === "paid"}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pembayaran
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {transaction.payment_status === "paid"
                    ? "Transaksi sudah lunas"
                    : "Tambah pembyaran untuk melunasi transaksi"}
                </TooltipContent>
              </Tooltip>
            }
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Transaction Info */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="h-4 w-4" />
            <span className="text-sm font-medium">Transaksi</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Kode</p>
            <p className="font-semibold">{transaction.code}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(transaction.transaction_date)}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <Badge className={cn("gap-1", statusConfig.className)}>
              <statusConfig.icon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
            <Badge className={cn("gap-1", paymentStatusConfig.className)}>
              <paymentStatusConfig.icon className="h-3 w-3" />
              {paymentStatusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Customer Info */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Pelanggan</span>
          </div>
          {transaction.customer ? (
            <div className="space-y-1">
              <p className="font-semibold">{transaction.customer.name}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.customer.email || "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                {transaction.customer.phone || "-"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada data</p>
          )}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Dibuat oleh</p>
            <p className="text-sm font-medium">
              {transaction.maker?.name || "-"}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-medium">Pembayaran</span>
          </div>
          {transaction.payments && transaction.payments.length > 0 ? (
            transaction.payments.map((payment: any) => (
              <div key={payment.id} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Metode</span>
                  <span className="font-medium">
                    {payment.paymentMethod?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">
                    {formatCurrencyIDR(payment.total)}
                  </span>
                </div>
                {payment.change > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Kembalian
                    </span>
                    <span className="font-medium">
                      {formatCurrencyIDR(payment.change)}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada data</p>
          )}
        </div>

        {/* Financial Summary */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Banknote className="h-4 w-4" />
            <span className="text-sm font-medium">Ringkasan</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatCurrencyIDR(transaction.price_before_discount_total)}
              </span>
            </div>
            <div className="flex justify-between text-destructive">
              <span className="text-sm">Diskon</span>
              <span className="font-medium">
                -{formatCurrencyIDR(transaction.discount_total)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Grand Total</span>
              <span className="font-bold text-primary">
                {formatCurrencyIDR(transaction.grand_total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Another Fees */}
      {transaction.anotherFees && transaction.anotherFees.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="p-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <h3 className="font-semibold text-sm">Biaya Lainnya</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20 border-b">
                <tr>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">
                    Nama
                  </th>
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">
                    Jumlah
                  </th>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {transaction.anotherFees.map((fee: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-2 text-sm font-medium">
                      {fee.name || "-"}
                    </td>
                    <td className="p-2 text-sm text-right font-medium">
                      {formatCurrencyIDR(fee.amount || 0)}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {fee.description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/20 border-t">
                <tr>
                  <td className="p-2 text-sm font-medium">
                    Total Biaya Lainnya
                  </td>
                  <td className="p-2 text-sm text-right font-bold text-primary">
                    {formatCurrencyIDR(transaction.other_cost_total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Products Table */}
      {transaction.transactionItems &&
        transaction.transactionItems.length > 0 && (
          <div className="rounded-lg border overflow-hidden">
            <div className="p-3 bg-muted/50 border-b">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <h3 className="font-semibold text-sm">Produk</h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {transaction.transactionItems.length} item
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 border-b">
                  <tr>
                    <th className="text-left p-2 font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="text-left p-2 font-medium text-muted-foreground">
                      Produk
                    </th>
                    <th className="text-left p-2 font-medium text-muted-foreground">
                      SKU
                    </th>
                    <th className="text-right p-2 font-medium text-muted-foreground">
                      Harga
                    </th>
                    <th className="text-right p-2 font-medium text-muted-foreground">
                      Qty
                    </th>
                    <th className="text-right p-2 font-medium text-muted-foreground">
                      Diskon
                    </th>
                    <th className="text-right p-2 font-medium text-muted-foreground">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.transactionItems.map(
                    (item: any, index: number) => (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">
                          <p className="font-medium">
                            {item.productSku?.product?.name ||
                              item.productSku?.name ||
                              "Produk"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.productSku?.unit?.name || "-"}
                          </p>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {item.productSku?.code || "-"}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrencyIDR(item.price)}
                        </td>
                        <td className="p-2 text-right">
                          {formatDecimal(item.quantity)}
                        </td>
                        <td className="p-2 text-right text-destructive">
                          {item.discount_amount > 0
                            ? formatCurrencyIDR(item.discount_amount)
                            : "-"}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {formatCurrencyIDR(item.subtotal)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
                <tfoot className="bg-muted/20 border-t">
                  <tr>
                    <td colSpan={4} className="p-2"></td>
                    <td className="p-2 text-right font-medium">Total</td>
                    <td className="p-2 text-right text-destructive">
                      {formatCurrencyIDR(transaction.discount_total)}
                    </td>
                    <td className="p-2 text-right font-bold text-primary">
                      {formatCurrencyIDR(transaction.grand_total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Product Details */}
            <details className="border-t">
              <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/30 transition-colors text-sm">
                <span className="font-medium">Detail Produk</span>
                <span className="text-muted-foreground">▼</span>
              </summary>
              <div className="p-3 space-y-3 border-t">
                {transaction.transactionItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg bg-background text-sm"
                  >
                    {/* SKU Details */}
                    {item.productSku && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          SKU
                        </p>
                        <div className="space-y-1">
                          <p>
                            <span className="text-muted-foreground">Kode:</span>{" "}
                            {item.productSku.code}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Nama:</span>{" "}
                            {item.productSku.name}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Harga Jual:
                            </span>{" "}
                            {formatCurrencyIDR(item.productSku.price)}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Harga Beli:
                            </span>{" "}
                            {formatCurrencyIDR(item.productSku.buy_price)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stock & Unit */}
                    {item.productSku && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Stok & Unit
                        </p>
                        <div className="space-y-1">
                          <p>
                            <span className="text-muted-foreground">Stok:</span>{" "}
                            {formatDecimal(item.productSku.stock_quantity)}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Unit:</span>{" "}
                            {item.productSku.unit?.name || "-"}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Tipe:</span>{" "}
                            {item.productSku.unit?.type || "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stock Batch */}
                    {item.stockBatch && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Batch Stok
                        </p>
                        <div className="space-y-1">
                          <p>
                            <span className="text-muted-foreground">
                              Kuantitas:
                            </span>{" "}
                            {formatDecimal(item.stockBatch.quantity)}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Sisa:</span>{" "}
                            {formatDecimal(item.stockBatch.remaining_quantity)}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Harga Beli:
                            </span>{" "}
                            {formatCurrencyIDR(item.stockBatch.buy_price)}
                          </p>
                          {item.stockBatch.stockLocation && (
                            <p>
                              <span className="text-muted-foreground">
                                Lokasi:
                              </span>{" "}
                              {item.stockBatch.stockLocation.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

      {/* Note */}
      {transaction.note && (
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground">Catatan</p>
          <p className="text-sm">{transaction.note}</p>
        </div>
      )}
    </div>
  );
}
