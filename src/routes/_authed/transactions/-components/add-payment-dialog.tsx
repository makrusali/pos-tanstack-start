import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BanknoteIcon,
  CheckIcon,
  ImageIcon,
  ReceiptIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import { CustomButton } from "../../pos-terminal/-components/button";
import {
  applyFormErrors,
  cn,
  formatCurrencyIDR,
  inputFormatRP,
  inputParseRP,
} from "#/lib/utils";
import { Label } from "#/components/ui/label";
import { getRouteApi } from "@tanstack/react-router";
import { Input } from "#/components/ui/input";
import { Separator } from "#/components/ui/separator";
import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentMethod } from "#/generated/prisma/browser";
import { savePaymentFn } from "#/lib/server/transactions";

const Route = getRouteApi("/_authed/transactions/detail/$id");

type Props = {
  Trigger: ReactNode;
  disabled?: boolean;
};

const AddPaymentDialog = ({ Trigger, disabled = false }: Props) => {
  const { id: transactionID } = Route.useParams();
  const { paymentMethods, transaction } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [paymentStep, setPaymentStep] = useState<
    | "selecting_payment_method"
    | "input_amount"
    | "processing"
    | "success"
    | "failed"
  >("selecting_payment_method");

  const [paidAmount, setPaidAmount] = useState<number>(0);
  const queryClient = useQueryClient();

  const processPayment = useMutation({
    onMutate: () => {
      setPaymentStep("processing");
    },
    onError: () => {
      setPaymentStep("failed");
    },
    onSuccess: () => {
      setPaymentStep("success");
    },
    mutationFn: savePaymentFn,
  });

  const handleSaveReceipt = () => {
    if (
      processPayment.data?.data?.bytes &&
      processPayment.data?.data?.filename
    ) {
      const filename = processPayment.data.data.filename;
      const bytes = processPayment.data.data.bytes;
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
  };

  const savePayment = async () => {
    if (selectedPaymentMethod === null) {
      return;
    }

    try {
      await processPayment.mutateAsync({
        data: {
          transaction_id: transactionID,
          customer_pay_amount: paidAmount,
          payment_method_id: selectedPaymentMethod.id,
        },
      });
    } catch (error: any) {
      applyFormErrors(null, error);
    }
  };

  if (transaction === null) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        setPaidAmount(0);
        setOpen(state);
        if (state === false) {
          queryClient.invalidateQueries({
            queryKey: ["transactions", transactionID],
          });
        }
      }}
    >
      <DialogTrigger disabled={disabled}>{Trigger}</DialogTrigger>

      <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl p-0 gap-0 overflow-hidden">
        {paymentStep === "selecting_payment_method" && (
          <div className="py-6">
            <div className="px-6 mb-6">
              <DialogHeader>
                <DialogTitle className="text-center text-xl text-slate-800">
                  Pilih Metode Pembayaran
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="px-6 space-y-3">
              {paymentMethods.map((pm) => (
                <CustomButton
                  variant="ghost"
                  className="w-full p-5 bg-slate-50 hover:bg-emerald-50 rounded-2xl flex items-center gap-4 transition-all group justify-start"
                  onClick={() => {
                    setSelectedPaymentMethod(pm);
                    setPaymentStep("input_amount");
                  }}
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {pm.image_path ? (
                      <img
                        src={pm.image_path}
                        alt={pm.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800">{pm.name}</p>
                    <p className="text-sm text-slate-400">{pm.description}</p>
                  </div>
                </CustomButton>
              ))}
            </div>

            <div className="mx-6 mt-6 p-5 bg-slate-50 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Bayar</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrencyIDR(transaction.remaining_payment)}
                </span>
              </div>
            </div>
          </div>
        )}

        {paymentStep === "input_amount" && (
          <div className="py-6">
            <div className="px-6">
              <CustomButton
                variant="ghost"
                className="flex items-center gap-2 text-slate-500 mb-4 hover:text-slate-800"
                onClick={() => setPaymentStep("selecting_payment_method")}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Kembali
              </CustomButton>

              <DialogHeader className="mb-6">
                <DialogTitle className="text-center text-xl text-slate-800">
                  Jumlah Bayar
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="px-6 space-y-5">
              <div className="bg-slate-50 rounded-2xl p-5 text-center">
                <p className="text-sm text-slate-400 mb-1">Total Tagihan</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatCurrencyIDR(transaction.remaining_payment)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Jumlah Diterima
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                    Rp
                  </span>
                  <Input
                    type="text"
                    value={inputFormatRP(paidAmount)}
                    onChange={(e) =>
                      setPaidAmount(inputParseRP(e.target.value))
                    }
                    placeholder="0"
                    className={cn(
                      "pl-14 h-16 text-2xl! font-bold text-right rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                    )}
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[5000, 10000, 20000, 50000, 100000].map((amt) => (
                  <CustomButton
                    key={amt}
                    variant="secondary"
                    className="py-3 rounded-xl text-sm"
                    onClick={() => setPaidAmount(amt)}
                  >
                    {formatCurrencyIDR(amt)}
                  </CustomButton>
                ))}
                <CustomButton
                  variant="primary"
                  className="py-3 rounded-xl text-sm"
                  onClick={() =>
                    setPaidAmount(
                      Math.ceil(transaction.remaining_payment / 1000) * 1000,
                    )
                  }
                >
                  <CheckIcon className="w-4 h-4 mr-1 inline" />
                  Pas
                </CustomButton>
              </div>

              {paidAmount > 0 && (
                <div
                  className={cn(
                    "p-5 rounded-2xl text-center",
                    paidAmount >= transaction.remaining_payment
                      ? "bg-emerald-50"
                      : "bg-rose-50",
                  )}
                >
                  <p className="text-sm text-slate-500 mb-1">
                    {paidAmount >= transaction.remaining_payment
                      ? "Kembalian"
                      : "Kurang"}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      paidAmount >= transaction.remaining_payment
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {formatCurrencyIDR(
                      Math.abs(paidAmount) - transaction.remaining_payment,
                    )}
                  </p>
                </div>
              )}

              <CustomButton
                variant="primary"
                className="w-full py-4 text-lg gap-2"
                disabled={
                  !paidAmount || paidAmount < transaction.remaining_payment
                }
                onClick={() => {
                  savePayment();
                }}
              >
                <CheckIcon className="w-5 h-5" />
                Bayar
              </CustomButton>
            </div>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="py-16 text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping" />
              <BanknoteIcon className="w-10 h-10 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Memproses Pembayaran
              </h3>
              <p className="text-slate-400">Mohon tunggu sebentar...</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="py-8 text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckIcon className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Pembayaran Berhasil!
              </h3>
              <p className="text-slate-400">Transaksi telah selesai</p>
            </div>

            <div className="mx-6 bg-slate-50 rounded-2xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Waktu</span>
                <span className="text-slate-700">
                  {new Date().toLocaleString("id-ID")}
                </span>
              </div>
              <Separator className="bg-slate-200" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total</span>
                <span className="font-bold text-slate-800">
                  {formatCurrencyIDR(transaction.remaining_payment)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Bayar</span>
                <span className="text-slate-700">
                  {formatCurrencyIDR(paidAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Kembalian</span>
                <span className="font-bold">
                  {formatCurrencyIDR(
                    paidAmount - transaction.remaining_payment,
                  )}
                </span>
              </div>
            </div>

            <div className="px-6 flex gap-3">
              <CustomButton
                variant="secondary"
                className="flex-1 py-4"
                onClick={() => handleSaveReceipt()}
              >
                <ReceiptIcon className="w-5 h-5 mr-2 inline" />
                Cetak
              </CustomButton>
            </div>
          </div>
        )}

        {paymentStep === "failed" && (
          <div className="py-8 text-center space-y-6">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangleIcon className="w-12 h-12 text-rose-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Pembayaran Gagal!
              </h3>
              <p className="text-slate-400">Transaksi tidak dapat diproses</p>
            </div>

            <div className="mx-6 bg-rose-50 rounded-2xl p-5 text-left space-y-3 border border-rose-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Waktu</span>
                <span className="text-slate-700">
                  {new Date().toLocaleString("id-ID")}
                </span>
              </div>
              <Separator className="bg-rose-200" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total</span>
                <span className="font-bold text-slate-800">
                  {formatCurrencyIDR(transaction.remaining_payment)}
                </span>
              </div>
            </div>

            <div className="px-6 flex gap-3">
              <CustomButton
                variant="secondary"
                className="flex-1 py-4"
                onClick={() => {
                  savePayment();
                }}
              >
                <RotateCcwIcon className="w-5 h-5 mr-2 inline" />
                Coba Lagi
              </CustomButton>
            </div>

            <div className="px-6">
              <CustomButton
                variant="danger"
                className="w-full py-3 text-sm"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <XIcon className="w-4 h-4 mr-2 inline" />
                Batalkan Pembayaran
              </CustomButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { AddPaymentDialog };
