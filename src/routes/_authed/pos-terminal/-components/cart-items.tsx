import {
  ImageIcon,
  MapPinIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  ShoppingCartIcon,
  StickyNoteIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import { usePosDispatch, usePosState } from "./use-pos";
import { cn, formatCurrencyIDR } from "#/lib/utils";
import { CustomButton } from "./button";
import { Input } from "#/components/ui/input";

const CartItems = () => {
  const dispatch = usePosDispatch();
  const { carts } = usePosState();

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {carts.length === 0 ? (
        <div className="flex flex-col h-full justify-center items-center gap-3 text-slate-400">
          <ShoppingCartIcon className="w-14 h-14 opacity-20" />
          <p className="text-sm">Keranjang masih kosong</p>
          <p className="text-xs">Scan barcode atau pilih produk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {carts.map((item) => {
            return (
              <div
                key={item.product_sku_id}
                className={cn(
                  "bg-slate-50 rounded-2xl p-3 overflow-hidden ring-1 ring-slate-100",
                )}
              >
                {/* Top row: Image + Info + Always-visible actions */}
                <div className="flex gap-3">
                  {/* Image */}
                  <div
                    className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                    // onClick={() => openEditItem(item)}
                  >
                    {item.product_image_path ? (
                      <img
                        src={item.product_image_path}
                        alt={item.product_display_name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">
                      {item.product_display_name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {formatCurrencyIDR(item.price)} / {item.unit.name}
                    </p>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.note && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-lg flex items-center gap-1">
                          <StickyNoteIcon className="w-3 h-3" />
                          {item.note.length > 15
                            ? item.note.slice(0, 15) + "..."
                            : item.note}
                        </span>
                      )}
                      {item.discount_type && item.discount_value > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-lg flex items-center gap-1">
                          <TagIcon className="w-3 h-3" />{" "}
                          {item.discount_type == "fixed"
                            ? `-${formatCurrencyIDR(item.discount_value)} - ${formatCurrencyIDR(item.discount_amount)} / ${item.unit.name}`
                            : `${item.discount_value}% - ${formatCurrencyIDR(item.discount_amount)} / ${item.unit.name}`}
                        </span>
                      )}

                      {/* {selectedLoc && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-lg flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          {selectedLoc.name}
                        </span>
                      )} */}
                    </div>
                  </div>

                  {/* Always-visible action buttons (touch optimized) */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <CustomButton
                      variant="secondary"
                      className="w-9 h-9 rounded-xl"
                      //   onClick={() => openEditItem(item)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </CustomButton>
                    <CustomButton
                      variant="danger"
                      className="w-9 h-9 rounded-xl"
                      onClick={() =>
                        dispatch({
                          type: "deleteCartItem",
                          payload: item.product_sku_id,
                        })
                      }
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </CustomButton>
                  </div>
                </div>

                {/* Quantity row with decimal input */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <CustomButton
                      variant="secondary"
                      className="w-10 h-10 rounded-xl"
                      onClick={() => {
                        dispatch({
                          type: "updateCartItemQuantity",
                          payload: {
                            newQty: item.quantity - 1,
                            product_sku_id: item.product_sku_id,
                          },
                        });
                        // const step = item.unit.type === "integer" ? 1 : 0.1;
                        // const newQty = Math.max(0, item.quantity - step);
                        // updateQuantity(item.product_sku_id, newQty.toString());
                      }}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </CustomButton>

                    <Input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => {
                        if (e.target.value !== "") {
                          dispatch({
                            type: "updateCartItemQuantity",
                            payload: {
                              newQty: Number(e.target.value),
                              product_sku_id: item.product_sku_id,
                            },
                          });
                        }
                      }}
                      className={cn(
                        "w-20 h-10 text-center font-bold text-slate-800 rounded-xl border-0 bg-white focus:ring-2 focus:ring-emerald-500",
                      )}
                    />

                    <CustomButton
                      variant="secondary"
                      className="w-10 h-10 rounded-xl"
                      onClick={() => {
                        dispatch({
                          type: "updateCartItemQuantity",
                          payload: {
                            newQty: item.quantity + 1,
                            product_sku_id: item.product_sku_id,
                          },
                        });
                      }}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </CustomButton>

                    <span className="text-xs text-slate-400 font-medium ml-1">
                      {item.unit.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-800">
                      {formatCurrencyIDR(item.subtotal)}
                    </p>
                    {item.discount_type !== null && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        Hemat {formatCurrencyIDR(item.discount_total)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { CartItems };
