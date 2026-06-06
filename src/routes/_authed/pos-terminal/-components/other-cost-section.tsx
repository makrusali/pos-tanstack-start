import { PlusIcon, Trash2Icon } from "lucide-react";
import { CustomButton } from "./button";
import { Input } from "#/components/ui/input";
import { usePosDispatch, usePosState } from "./use-pos";
import { cn, inputFormatRP, inputParseRP } from "#/lib/utils";

const OtherCostSection = () => {
  const state = usePosState();
  const dispatch = usePosDispatch();

  return (
    <div className="border-t border-slate-100 px-3 py-2 bg-amber-50/30 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Biaya Lain
        </h3>
        <CustomButton
          variant="ghost"
          className="h-7 px-2 gap-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg"
          onClick={() =>
            dispatch({
              type: "addOtherCost",
            })
          }
        >
          <PlusIcon className="w-3 h-3" />
          Tambah
        </CustomButton>
      </div>
      <div className="space-y-1.5">
        {state.otherCosts.map((cost) => (
          <div
            key={cost.id}
            className={cn("flex items-center gap-2 p-2 rounded-xl bg-white")}
          >
            <Input
              value={cost.note}
              onChange={(e) =>
                dispatch({
                  type: "updateNoteOtherCost",
                  payload: {
                    id: cost.id,
                    note: e.target.value,
                  },
                })
              }
              className="h-8 text-xs flex-1 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Nama biaya"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                Rp
              </span>
              <Input
                type="text"
                value={inputFormatRP(cost.amount)}
                onChange={(e) =>
                  dispatch({
                    type: "updateAmountOtherCost",
                    payload: {
                      id: cost.id,
                      amount: inputParseRP(e.target.value),
                    },
                  })
                }
                className={cn(
                  "h-8 text-xs w-28 pl-7 text-right rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                )}
              />
            </div>
            <CustomButton
              variant="danger"
              className="w-8 h-8 rounded-lg shrink-0"
              onClick={() =>
                dispatch({
                  type: "removeOtherCost",
                  payload: {
                    id: cost.id,
                  },
                })
              }
            >
              <Trash2Icon className="w-3 h-3" />
            </CustomButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export { OtherCostSection };
