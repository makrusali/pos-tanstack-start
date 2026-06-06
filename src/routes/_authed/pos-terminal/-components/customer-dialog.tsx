import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { ScrollArea } from "#/components/ui/scroll-area";
import { getRouteApi } from "@tanstack/react-router";
import { CheckIcon, SearchIcon, User2Icon } from "lucide-react";
import { usePosDispatch, usePosState } from "./use-pos";
import { useMemo, useState } from "react";
import { cn } from "#/lib/utils";
import { CustomButton } from "./button";

const Route = getRouteApi("/_authed/pos-terminal/");

const CustomerDialog = () => {
  const state = usePosState();
  const dispatch = usePosDispatch();
  const [customerSearch, setCustomerSearch] = useState("");
  const { customers } = Route.useLoaderData();

  const customer = customers.find((c) => c.id === state.selectedCustomerId);
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.includes(customerSearch) || c.contact?.includes(customerSearch),
    );
  }, [customers, customerSearch]);

  return (
    <Dialog
      open={state.dialogMode === "selecting_customer"}
      onOpenChange={(open) => {
        if (!open) {
          dispatch({
            type: "changeDialogMode",
            payload: {
              mode: "none",
            },
          });
        }
      }}
    >
      <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <User2Icon className="w-5 h-5 text-emerald-500" />
            Pilih Pelanggan
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari nama atau telepon..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="pl-11 h-12 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <ScrollArea className="h-80">
          <div className="space-y-2 pr-2">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  dispatch({
                    type: "changeSelectedCustomer",
                    payload: {
                      id: c.id,
                    },
                  });
                }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all",
                  customer?.id === c.id
                    ? "bg-emerald-50 border-2 border-emerald-200"
                    : "hover:bg-slate-50 border-2 border-transparent",
                )}
              >
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-sm text-slate-400">{c.contact}</p>
                </div>
                {customer?.id === c.id && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t bg-slate-50/50 flex gap-3">
          <CustomButton
            variant="primary"
            className="flex-1 py-4 gap-2"
            onClick={() => {
              dispatch({
                type: "changeDialogMode",
                payload: {
                  mode: "none",
                },
              });
            }}
          >
            OK
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CustomerDialog };
