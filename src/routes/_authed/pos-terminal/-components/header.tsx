import {
  BarcodeIcon,
  CameraIcon,
  ExpandIcon,
  MinimizeIcon,
  RotateCcwIcon,
  SearchIcon,
  StoreIcon,
} from "lucide-react";
import { CustomButton } from "./button";
import { Input } from "#/components/ui/input";
import { useConfirmDialog } from "./confirm-dialog";
import { usePosDispatch, usePosState } from "./use-pos";
import { toast } from "sonner";

const Header = () => {
  const state = usePosState();
  const dispatch = usePosDispatch();

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

  return (
    <div className="flex items-center p-3 sm:p-4 gap-2 sm:gap-3 shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-100">
      <resetDialog.Dialog />

      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-900/20">
          <StoreIcon className="w-5 h-5" />
        </div>

        <CustomButton
          variant={state.mode === "barcode_scanner" ? "primary" : "secondary"}
          className="h-10 px-3 sm:px-4 gap-2 text-sm shrink-0"
          onClick={() => {
            dispatch({
              type: "setScanMode",
              payload:
                state.mode === "barcode_scanner" ? "none" : "barcode_scanner",
            });
            toast.info(
              state.mode === "barcode_scanner"
                ? "Mode scan barcode dinonaktifkan"
                : "Mode scan barcode diaktifkan",
            );
          }}
        >
          <BarcodeIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Scan</span>
        </CustomButton>

        <CustomButton
          variant="secondary"
          className="h-10 px-3 sm:px-4 gap-2 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0"
          onClick={() => {
            dispatch({
              type: "setScanMode",
              payload: "camera_scanner",
            });
          }}
        >
          <CameraIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Kamera</span>
        </CustomButton>

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
