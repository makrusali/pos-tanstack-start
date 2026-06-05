import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { CustomButton } from "./button";
import { usePosDispatch, usePosState } from "./use-pos";
import {
  cn,
  formatCurrencyIDR,
  inputFormatRP,
  inputParseRP,
} from "#/lib/utils";
import { Label } from "#/components/ui/label";
import { getRouteApi } from "@tanstack/react-router";
import { Input } from "#/components/ui/input";
import { Separator } from "#/components/ui/separator";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { saveTransactionFn } from "#/lib/server/pos";

const Route = getRouteApi("/_authed/pos-terminal/");

const PaymentDialog = () => {
  const { paymentMethods } = Route.useLoaderData();

  const state = usePosState();
  const dispatch = usePosDispatch();
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const processPayment = useMutation({
    onMutate: () => {
      dispatch({
        type: "changePaymentStep",
        payload: {
          step: "processing",
        },
      });
    },
    onError: () => {
      dispatch({
        type: "changePaymentStep",
        payload: {
          step: "failed",
        },
      });
    },
    mutationFn: saveTransactionFn,
  });

  const saveTransaction = () => {
    processPayment.mutate();
  };

  return (
    <Dialog
      open={state.dialogMode === "payment"}
      onOpenChange={(open) => {
        setPaidAmount(0);
        dispatch({
          type: "changeDialogMode",
          payload: {
            mode: open ? "payment" : "none",
          },
        });
      }}
    >
      <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl p-0 gap-0 overflow-hidden">
        {state.paymentStep === "selecting_payment_method" && (
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
                  onClick={() =>
                    dispatch({
                      type: "changePaymentMethod",
                      payload: pm,
                    })
                  }
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
                  {formatCurrencyIDR(state.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {state.paymentStep === "input_amount" && (
          <div className="py-6">
            <div className="px-6">
              <CustomButton
                variant="ghost"
                className="flex items-center gap-2 text-slate-500 mb-4 hover:text-slate-800"
                onClick={() =>
                  dispatch({
                    type: "changePaymentStep",
                    payload: {
                      step: "selecting_payment_method",
                    },
                  })
                }
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
                  {formatCurrencyIDR(state.total)}
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
                    setPaidAmount(Math.ceil(state.total / 1000) * 1000)
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
                    paidAmount >= state.total ? "bg-emerald-50" : "bg-rose-50",
                  )}
                >
                  <p className="text-sm text-slate-500 mb-1">
                    {paidAmount >= state.total ? "Kembalian" : "Kurang"}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      paidAmount >= state.total
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {formatCurrencyIDR(Math.abs(paidAmount) - state.total)}
                  </p>
                </div>
              )}

              <CustomButton
                variant="primary"
                className="w-full py-4 text-lg gap-2"
                disabled={!paidAmount || paidAmount < state.total}
                onClick={() => {
                  saveTransaction();
                }}
              >
                <CheckIcon className="w-5 h-5" />
                Bayar
              </CustomButton>
            </div>
          </div>
        )}

        {state.paymentStep === "processing" && (
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

        {state.paymentStep === "success" && (
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
                <span className="text-slate-400">ID Transaksi</span>
                <span className="font-mono font-medium text-slate-700">
                  #TRX-{Date.now().toString().slice(-6)}
                </span>
              </div>
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
                  {formatCurrencyIDR(state.total)}
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
                  {formatCurrencyIDR(paidAmount - state.total)}
                </span>
              </div>
            </div>

            <div className="px-6 flex gap-3">
              <CustomButton variant="secondary" className="flex-1 py-4">
                <ReceiptIcon className="w-5 h-5 mr-2 inline" />
                Cetak
              </CustomButton>
              <CustomButton
                variant="primary"
                className="flex-1 py-4"
                onClick={() =>
                  dispatch({
                    type: "changeDialogMode",
                    payload: {
                      mode: "none",
                    },
                  })
                }
              >
                Transaksi Baru
              </CustomButton>
            </div>
          </div>
        )}

        {state.paymentStep === "failed" && (
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
                  {formatCurrencyIDR(state.total)}
                </span>
              </div>
            </div>

            <div className="px-6 flex gap-3">
              <CustomButton
                variant="secondary"
                className="flex-1 py-4"
                onClick={() => {
                  saveTransaction();
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
                  dispatch({
                    type: "changeDialogMode",
                    payload: {
                      mode: "none",
                    },
                  });
                }}
              >
                <XIcon className="w-4 h-4 mr-2 inline" />
                Batalkan Transaksi
              </CustomButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { PaymentDialog };
