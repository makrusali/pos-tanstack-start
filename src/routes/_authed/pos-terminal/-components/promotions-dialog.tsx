// TODO(makrusali): hold this feature
const PromotionsDialog = () => {
  return (
    <Dialog open={isPromoOpen} onOpenChange={setIsPromoOpen}>
      <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl p-0 gap-0 max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              Promosi Aktif
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-3 pr-2">
            {MOCK_PROMOTIONS.map((promo) => {
              const isActive = activePromotions.includes(promo.id);
              return (
                <div
                  key={promo.id}
                  onClick={() => togglePromotion(promo.id)}
                  className={cn(
                    "p-5 rounded-2xl cursor-pointer transition-all",
                    isActive
                      ? "bg-linear-to-r from-emerald-50 to-teal-50 ring-2 ring-emerald-200"
                      : "bg-slate-50 hover:bg-slate-100",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            "font-bold",
                            isActive ? "text-emerald-700" : "text-slate-700",
                          )}
                        >
                          {promo.name}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {promo.description}
                      </p>
                      <div className="flex gap-2">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            promo.type === "percent"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700",
                          )}
                        >
                          {promo.type === "percent"
                            ? `${promo.value}%`
                            : formatCurrencyIDR(promo.value)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                          {promo.target === "transaction"
                            ? "Transaksi"
                            : "Kategori"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1",
                        isActive ? "bg-emerald-500" : "bg-slate-200",
                      )}
                    >
                      {isActive && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-slate-50/50 flex gap-3">
          <CustomButton
            variant="secondary"
            className="flex-1 py-3"
            onClick={clearPromotions}
          >
            Hapus Semua
          </CustomButton>
          <CustomButton
            variant="primary"
            className="flex-1 py-3"
            onClick={() => setIsPromoOpen(false)}
          >
            Selesai
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { PromotionsDialog };
