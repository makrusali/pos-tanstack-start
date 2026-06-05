import { Separator } from "#/components/ui/separator";
import { formatCurrencyIDR } from "#/lib/utils";
import { usePosState } from "./use-pos";

const SummarySection = () => {
  const state = usePosState();

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-1.5 shrink-0">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Subtotal</span>
        <span className="font-semibold text-slate-700">
          {formatCurrencyIDR(state.subtotal)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Biaya Lain</span>
        <span className="font-semibold text-slate-700">
          {formatCurrencyIDR(state.otherCostTotal)}
        </span>
      </div>

      {/* {activePromotions.length > 0 && (
        <div className="flex justify-between text-sm text-purple-600">
          <span className="flex items-center gap-1">
            <TicketCheckIcon className="w-3 h-3" />
            Promo
          </span>
          <span className="font-semibold">
            -{formatCurrencyIDR(promoDiscount)}
          </span>
        </div>
      )} */}
      <Separator className="bg-slate-200 my-1" />
      <div className="flex justify-between items-center">
        <span className="font-bold text-slate-800">Total</span>
        <span className="text-2xl font-bold text-emerald-600">
          {formatCurrencyIDR(state.total)}
        </span>
      </div>
    </div>
  );
};

export { SummarySection };
