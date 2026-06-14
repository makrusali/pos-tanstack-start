import { getRouteApi } from "@tanstack/react-router";
import { CalculatorIcon, ChevronDownIcon, User2Icon } from "lucide-react";
import { CustomButton } from "./button";
import { useConfirmDialog } from "./use-confirm-dialog";
import { usePosDispatch, usePosState } from "./use-pos";
import { ProductGrid } from "./products-grid";
import { CartItems } from "./cart-items";
import { Header } from "./header";
import { OtherCostSection } from "./other-cost-section";
import { SummarySection } from "./summary-section";
import { PaymentActions } from "./payment-actions";
import { PaymentDialog } from "./payment-dialog";
import { CartItemEditDialog } from "./cart-item-edit-dialog";
import { useCalculator } from "./use-calculator-dialog";
import { CustomerDialog } from "./customer-dialog";

export const Route = getRouteApi("/_authed/pos-terminal/");

const PosPage = () => {
  const { customers } = Route.useLoaderData();

  const dispatch = usePosDispatch();
  const state = usePosState();

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

  const calculator = useCalculator();
  const selectedCustomer = customers.find(
    (c) => c.id === state.selectedCustomerId,
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-50 z-50 flex">
      <resetDialog.Dialog />
      <CartItemEditDialog />
      <CustomerDialog />
      <calculator.Dialog />
      <PaymentDialog />

      <div className="flex flex-col h-full w-full min-w-0 bg-slate-50">
        <Header />

        <ProductGrid />
        <div className="p-3 border-t border-slate-100 bg-white/80 backdrop-blur-sm shrink-0 flex gap-2">
          <calculator.Trigger>
            {({ setOpen }) => (
              <CustomButton
                variant="secondary"
                className="flex-1 py-3 gap-2 text-sm"
                onClick={() => setOpen(true)}
              >
                <CalculatorIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Kalkulator</span>
              </CustomButton>
            )}
          </calculator.Trigger>

          {/* <CustomButton
              variant="secondary"
              className="flex-1 py-3 gap-2 text-sm relative"
              onClick={() => setIsPromoOpen(true)}
            >
              <TicketCheckIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Promo</span>
              {activePromotions.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activePromotions.length}
                </span>
              )}
            </CustomButton> */}
        </div>
      </div>

      <div className="w-full sm:w-105 h-full border-l border-slate-100 flex flex-col bg-white shrink-0 fixed sm:relative inset-0 z-40 sm:z-auto translate-x-full sm:translate-x-0 transition-transform duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 p-3 sm:p-4 shrink-0 bg-white/80 backdrop-blur-sm">
          <CustomButton
            variant="secondary"
            className="h-9 px-3 gap-2 text-sm rounded-xl flex-1 justify-start"
            onClick={() => {
              dispatch({
                type: "changeDialogMode",
                payload: {
                  mode: "selecting_customer",
                },
              });
            }}
          >
            <User2Icon className="w-4 h-4" />
            <span className="max-w-full truncate">
              {selectedCustomer?.name ?? "Pelanggan Umum"}
            </span>
            <ChevronDownIcon className="w-3 h-3" />
          </CustomButton>
        </div>

        <CartItems />
        <OtherCostSection />
        <SummarySection />

        <PaymentActions />
      </div>
    </div>
  );
};

export { PosPage };
