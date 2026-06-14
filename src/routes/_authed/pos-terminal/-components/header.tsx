import {
  BarcodeIcon,
  CameraIcon,
  ChevronLeftIcon,
  ExpandIcon,
  MinimizeIcon,
  RotateCcwIcon,
  SearchIcon,
  StoreIcon,
} from "lucide-react";
import { CustomButton } from "./button";
import { Input } from "#/components/ui/input";
import { useConfirmDialog } from "./use-confirm-dialog";
import { usePosDispatch, usePosState } from "./use-pos";
import { toast } from "sonner";
import { useCameraBaroceScanner } from "./use-camera-scanner-dialog";
import { useBarcodeScanner } from "./use-barcode-scanner";
import { getRouteApi, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { wrapFn } from "#/lib/utils";
import { getPosProductsFn } from "#/lib/server/pos";
import Decimal from "decimal.js";

const Route = getRouteApi("/_authed/pos-terminal/");

const Header = () => {
  const state = usePosState();
  const dispatch = usePosDispatch();
  const { products: initialProducts } = Route.useLoaderData();
  const { data: products } = useQuery({
    queryKey: ["pos-products"],
    initialData: initialProducts,
    queryFn: () => wrapFn(getPosProductsFn(), []),
  });
  const router = useRouter();

  const resetDialog = useConfirmDialog({
    onConfirm: () => {
      dispatch({
        type: "clearCart",
      });
    },
    title: "Konfirmasi Reset",
    description:
      "Yakin ingin mengosongkan semua item di keranjang? Tindakan ini tidak dapat dibatalkan.",
  });

  const cameraBarcodeScanner = useCameraBaroceScanner({
    onScanned: (code) => {
      const findedProducts = products.find((p) => p.code === code);
      if (!findedProducts) {
        toast.error("Produk tidak ditemukan.", {
          position: "top-center",
        });
        return;
      }

      dispatch({
        type: "addToCart",
        payload: {
          selected_stock_location_id: null,
          stock_locations: findedProducts.stock_locations,
          product_sku_id: findedProducts.sku_id,
          product_display_name: findedProducts.display_name,
          product_image_path: findedProducts.sku_image_path,
          stock_quantity: findedProducts.stock_quantity,
          unit: findedProducts.unit,
          price: findedProducts.price,
          quantity: new Decimal(0),
          discount_type: null,
          discount_value: 0,
          note: "",
          discount_amount: 0,
          subtotal: 0,
          discount_total: 0,
          price_after_discount: 0,
        },
      });
    },
  });

  useBarcodeScanner({
    onEnter: (code) => {
      const findedProducts = products.find((p) => p.code === code);
      if (!findedProducts) {
        toast.error("Produk tidak ditemukan.", {
          position: "top-center",
        });
        return;
      }

      dispatch({
        type: "addToCart",
        payload: {
          selected_stock_location_id: null,
          stock_locations: findedProducts.stock_locations,
          product_sku_id: findedProducts.sku_id,
          product_display_name: findedProducts.display_name,
          product_image_path: findedProducts.sku_image_path,
          stock_quantity: findedProducts.stock_quantity,
          unit: findedProducts.unit,
          price: findedProducts.price,
          quantity: new Decimal(0),
          discount_type: null,
          discount_value: 0,
          note: "",
          discount_amount: 0,
          subtotal: 0,
          discount_total: 0,
          price_after_discount: 0,
        },
      });
    },
    active: state.mode === "barcode_scanner",
  });

  return (
    <div className="flex items-center p-3 sm:p-4 gap-2 sm:gap-3 shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-100">
      <resetDialog.Dialog />
      <cameraBarcodeScanner.Dialog />

      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-900/20"
          onClick={() => {
            router.history.back();
          }}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </div>

        <CustomButton
          variant={state.mode === "barcode_scanner" ? "primary" : "secondary"}
          className="h-10 px-3 sm:px-4 gap-2 text-sm shrink-0"
          onClick={(e) => {
            e.currentTarget.blur();

            dispatch({
              type: "setScanMode",
              payload:
                state.mode === "barcode_scanner" ? "none" : "barcode_scanner",
            });
            toast.info(
              state.mode === "barcode_scanner"
                ? "Mode scan barcode dinonaktifkan"
                : "Mode scan barcode diaktifkan",
              {
                position: "top-center",
              },
            );
          }}
        >
          <BarcodeIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Scan</span>
        </CustomButton>

        <cameraBarcodeScanner.Trigger>
          {({ open, setOpen }) => (
            <CustomButton
              variant={open ? "primary" : "secondary"}
              className="h-10 px-3 sm:px-4 gap-2 text-sm shrink-0"
              onClick={() => {
                dispatch({
                  type: "setScanMode",
                  payload: "camera_scanner",
                });
                setOpen(true);
              }}
            >
              <CameraIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Kamera</span>
            </CustomButton>
          )}
        </cameraBarcodeScanner.Trigger>

        <div className="relative flex-1 min-w-0">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari produk..."
            value={state.searchProductKeyword}
            onChange={(e) =>
              dispatch({
                type: "setProductSearchKeyword",
                payload: e.target.value,
              })
            }
            className="pl-10 h-10 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2 items-center shrink-0">
        <CustomButton
          variant="ghost"
          className="w-10 h-10 rounded-xl hidden sm:flex"
          //   onClick={toggleFullscreen}
        >
          {false ? (
            <MinimizeIcon className="w-4 h-4" />
          ) : (
            <ExpandIcon className="w-4 h-4" />
          )}
        </CustomButton>

        <resetDialog.Trigger>
          {(_, setOpen) => {
            return (
              <CustomButton
                variant="danger"
                className="h-10 px-3 sm:px-4 gap-2 text-sm"
                onClick={() => {
                  setOpen(true);
                }}
              >
                <RotateCcwIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </CustomButton>
            );
          }}
        </resetDialog.Trigger>
      </div>
    </div>
  );
};

export { Header };
