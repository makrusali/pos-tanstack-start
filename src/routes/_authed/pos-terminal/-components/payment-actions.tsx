import { CoinsIcon } from "lucide-react";
import { CustomButton } from "./button";
import { usePosDispatch } from "./use-pos";

const PaymentActions = () => {
  const dispatch = usePosDispatch();

  return (
    <div className="p-3 border-t border-slate-100 space-y-2 shrink-0 bg-white">
      <CustomButton
        variant="primary"
        className="w-full h-14 text-lg gap-2"
        onClick={() =>
          dispatch({
            type: "changeDialogMode",
            payload: {
              mode: "payment",
            },
          })
        }
      >
        <CoinsIcon className="w-6 h-6" />
        <p className="font-bold">Bayar Sekarang</p>
      </CustomButton>
      <div className="grid grid-cols-2 gap-2">
        <CustomButton variant="secondary" className="h-11 text-sm">
          Simpan Draft
        </CustomButton>
        <CustomButton
          variant="ghost"
          className="h-11 text-sm bg-slate-50 text-slate-500 hover:bg-slate-100"
        >
          Pending
        </CustomButton>
      </div>
    </div>
  );
};

export { PaymentActions };
