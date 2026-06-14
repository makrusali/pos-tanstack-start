import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import {
  cn,
  formatCurrencyIDR,
  inputFormatRP,
  inputParseRP,
} from "#/lib/utils";
import {
  CheckIcon,
  CoinsIcon,
  HashIcon,
  ImageIcon,
  MapPinIcon,
  MinusIcon,
  PencilIcon,
  PercentIcon,
  PlusIcon,
  StickyNoteIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { CustomButton } from "./button";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Badge } from "#/components/ui/badge";
import { Textarea } from "#/components/ui/textarea";
import { usePosDispatch, usePosState } from "./use-pos";
import { useConfirmDialog } from "./use-confirm-dialog";

const CartItemEditDialog = () => {
  const state = usePosState();
  const dispatch = usePosDispatch();
  const cartItemBeingEdited = state.carts.find(
    (ci) => ci.product_sku_id === state.cartItemBeingEdited?.product_sku_id,
  );

  const cancelConfirmDialog = useConfirmDialog({
    title: "Batalkan Perubahan",
    description: "Anda akan membatalkan perubahan yang dilakukan?",
    onConfirm: () => {
      dispatch({
        type: "cancelCartEditItem",
      });
    },
  });

  return (
    <Dialog
      open={state.isOpenEditingDialog}
      onOpenChange={(open) =>
        !open &&
        dispatch({
          type: "closeDialogUpdateCartItem",
        })
      }
    >
      <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <cancelConfirmDialog.Dialog />

        {cartItemBeingEdited && (
          <>
            <div className="p-6 border-b bg-slate-50/50">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-800">
                  <PencilIcon className="w-5 h-5 text-emerald-500" />
                  Edit Item
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                {cartItemBeingEdited.product_image_path ? (
                  <img
                    src={cartItemBeingEdited.product_image_path}
                    alt=""
                    className="w-16 h-16 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-800">
                    {cartItemBeingEdited.product_display_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatCurrencyIDR(cartItemBeingEdited.price)} /{" "}
                    {cartItemBeingEdited.unit.name}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <HashIcon className="w-4 h-4 text-slate-400" />
                  Kuantitas ({cartItemBeingEdited.unit.name})
                </Label>
                <div className="flex items-center gap-3">
                  <CustomButton
                    variant="secondary"
                    className="w-14 h-14 rounded-2xl"
                    onClick={() => {
                      dispatch({
                        type: "updateCartItemQuantity",
                        payload: {
                          newQty: cartItemBeingEdited!.quantity.toNumber() - 1,
                          product_sku_id: cartItemBeingEdited!.product_sku_id,
                        },
                      });
                    }}
                  >
                    <MinusIcon className="w-5 h-5" />
                  </CustomButton>
                  <Input
                    type="number"
                    value={cartItemBeingEdited.quantity.toNumber()}
                    onChange={(e) => {
                      dispatch({
                        type: "updateCartItemQuantity",
                        payload: {
                          newQty: Number(e.target.value),
                          product_sku_id: cartItemBeingEdited!.product_sku_id,
                        },
                      });
                    }}
                    className={cn(
                      "flex-1 h-14 text-center text-2xl font-bold rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                    )}
                  />
                  <CustomButton
                    variant="secondary"
                    className="w-14 h-14 rounded-2xl"
                    onClick={() => {
                      dispatch({
                        type: "updateCartItemQuantity",
                        payload: {
                          newQty: cartItemBeingEdited!.quantity.toNumber() + 1,
                          product_sku_id: cartItemBeingEdited!.product_sku_id,
                        },
                      });
                    }}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </CustomButton>
                </div>
                <p className="text-xs text-slate-400">
                  Tipe:{" "}
                  {cartItemBeingEdited.unit.type === "integer"
                    ? "Bilangan bulat"
                    : "Desimal"}
                </p>
              </div>

              {/* Stock Location */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                  Lokasi Stok
                </Label>
                <Select
                  value={cartItemBeingEdited.selected_stock_location_id || ""}
                  onValueChange={(v) => {
                    dispatch({
                      type: "updateCartItemSelectedStockLocation",
                      payload: {
                        product_sku_id: cartItemBeingEdited.product_sku_id,
                        stock_location_id: v,
                      },
                    });
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500">
                    <SelectValue placeholder="Pilih lokasi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cartItemBeingEdited.stock_locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center justify-between w-full gap-6">
                          <span>{loc.name}</span>
                          <div className="flex items-center gap-2">
                            {loc.is_primary && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                              >
                                Utama
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {loc.quantity.toNumber().toLocaleString("id-ID")}{" "}
                              unit
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-slate-400" />
                  Diskon
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <CustomButton
                    variant={
                      cartItemBeingEdited.discount_type === null
                        ? "primary"
                        : "secondary"
                    }
                    className="py-3 rounded-2xl"
                    onClick={() => {
                      dispatch({
                        type: "updateCartItemDiscountType",
                        payload: {
                          product_sku_id: cartItemBeingEdited.product_sku_id,
                          discountType: null,
                        },
                      });
                    }}
                  >
                    <XIcon className="w-4 h-4 mr-2 inline" />
                    Tanpa Diskon
                  </CustomButton>
                  <CustomButton
                    variant={
                      cartItemBeingEdited.discount_type === "percent"
                        ? "primary"
                        : "secondary"
                    }
                    className="py-3 rounded-2xl"
                    onClick={() => {
                      dispatch({
                        type: "updateCartItemDiscountType",
                        payload: {
                          product_sku_id: cartItemBeingEdited.product_sku_id,
                          discountType: "percent",
                        },
                      });
                    }}
                  >
                    <PercentIcon className="w-4 h-4 mr-2 inline" />
                    Persen
                  </CustomButton>
                  <CustomButton
                    variant={
                      cartItemBeingEdited.discount_type === "fixed"
                        ? "primary"
                        : "secondary"
                    }
                    className="py-3 rounded-2xl"
                    onClick={() => {
                      dispatch({
                        type: "updateCartItemDiscountType",
                        payload: {
                          product_sku_id: cartItemBeingEdited.product_sku_id,
                          discountType: "fixed",
                        },
                      });
                    }}
                  >
                    <CoinsIcon className="w-4 h-4 mr-2 inline" />
                    Tetap
                  </CustomButton>
                </div>
                {cartItemBeingEdited.discount_type !== null && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                      {cartItemBeingEdited.discount_type === "percent"
                        ? "%"
                        : "Rp"}
                    </span>
                    <Input
                      type="text"
                      value={
                        cartItemBeingEdited.discount_type === "fixed"
                          ? inputFormatRP(cartItemBeingEdited.discount_value)
                          : cartItemBeingEdited.discount_value
                      }
                      onChange={(e) => {
                        dispatch({
                          type: "updateCartItemDiscountValue",
                          payload: {
                            product_sku_id: cartItemBeingEdited.product_sku_id,
                            discountValue:
                              cartItemBeingEdited.discount_type === "fixed"
                                ? inputParseRP(e.target.value)
                                : Number(e.target.value),
                          },
                        });
                      }}
                      placeholder="0"
                      className={cn(
                        "pl-12 h-14 text-xl font-bold rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                      )}
                    />
                  </div>
                )}
              </div>
              {/* Note */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <StickyNoteIcon className="w-4 h-4 text-slate-400" />
                  Catatan
                </Label>
                <Textarea
                  value={cartItemBeingEdited.note ?? ""}
                  onChange={(e) => {
                    dispatch({
                      type: "updateCartItemNote",
                      payload: {
                        product_sku_id: cartItemBeingEdited.product_sku_id,
                        note: e.target.value,
                      },
                    });
                  }}
                  placeholder="Catatan item pembelian"
                  rows={3}
                  className={cn(
                    "resize-none rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                  )}
                />
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50 flex gap-3">
              <cancelConfirmDialog.Trigger>
                {(_, setOpen) => (
                  <CustomButton
                    variant="secondary"
                    className="flex-1 py-4"
                    onClick={() => {
                      setOpen(true);
                    }}
                  >
                    Batal
                  </CustomButton>
                )}
              </cancelConfirmDialog.Trigger>
              <CustomButton
                variant="primary"
                className="flex-1 py-4 gap-2"
                onClick={() => {
                  dispatch({
                    type: "saveCartEditItem",
                  });
                }}
              >
                <CheckIcon className="w-5 h-5" />
                Simpan
              </CustomButton>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { CartItemEditDialog };
