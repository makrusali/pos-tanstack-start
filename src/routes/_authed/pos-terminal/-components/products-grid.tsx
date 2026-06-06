import { getRouteApi } from "@tanstack/react-router";
import { usePosDispatch, usePosState } from "./use-pos";
import { useMemo } from "react";
import { ScrollArea } from "#/components/ui/scroll-area";
import { ImageIcon, LayersIcon, ScaleIcon } from "lucide-react";
import { cn, formatCurrencyIDR } from "#/lib/utils";

const Route = getRouteApi("/_authed/pos-terminal/");

const ProductGrid = () => {
  const state = usePosState();
  const dispatch = usePosDispatch();

  const { products } = Route.useLoaderData();
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.display_name.toLowerCase().includes(state.searchProductKeyword),
    );
  }, [state.searchProductKeyword]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 p-3 gap-3">
          {filteredProducts.map((p) => {
            const totalStock = p.stock_quantity;
            const isLowStock = totalStock <= 5;

            return (
              <div
                key={p.sku_id}
                onClick={() => {
                  dispatch({
                    type: "addToCart",
                    payload: {
                      selected_stock_location_id: null,
                      stock_locations: p.stock_locations,
                      product_sku_id: p.sku_id,
                      product_display_name: p.display_name,
                      product_image_path: p.sku_image_path,
                      stock_quantity: p.stock_quantity || 0,
                      unit: p.unit,
                      price: p.price,
                      quantity: 0,
                      discount_type: null,
                      discount_value: 0,
                      note: "",
                      discount_amount: 0,
                      subtotal: 0,
                      discount_total: 0,
                      price_after_discount: 0,
                    },
                  });
                }}
                className={cn(
                  "bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200",
                  "hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1",
                  "active:scale-[0.98] active:shadow-md",
                  "ring-1 ring-slate-100",
                )}
              >
                {/* Image */}
                <div className="w-full aspect-[4/3] relative bg-slate-100 overflow-hidden">
                  {p.sku_image_path ? (
                    <img
                      src={p.sku_image_path}
                      alt={p.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  {/* Stock badge */}
                  <div className="absolute top-2 right-2">
                    {isLowStock ? (
                      <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg shadow-lg">
                        Stok {totalStock}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded-lg shadow-lg">
                        Stok {totalStock}
                      </span>
                    )}
                  </div>

                  {/* Unit badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                      <ScaleIcon className="w-3 h-3" />
                      {p.unit.name}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] text-slate-400 mb-0.5 line-clamp-1 uppercase tracking-wide">
                    {p.product_name}
                  </p>
                  <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-2 min-h-[2.5rem] leading-snug">
                    {p.sku_name || p.display_name}
                  </h3>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrencyIDR(p.price)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        per {p.unit.name}{" "}
                        {p.unit.type === "decimal" && "• desimal"}
                      </p>
                    </div>
                    {p.stock_locations && p.stock_locations.length > 1 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-lg flex items-center gap-1">
                        <LayersIcon className="w-3 h-3" />
                        {p.stock_locations.length} lokasi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export { ProductGrid };
