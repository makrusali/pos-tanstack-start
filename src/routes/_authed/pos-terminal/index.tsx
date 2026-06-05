import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { ScrollArea, ScrollBar } from "#/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { Label } from "#/components/ui/label";
import { Badge } from "#/components/ui/badge";
import { Separator } from "#/components/ui/separator";
import { getCategoriesFn } from "#/lib/server/categories";
import { getPosProductsFn } from "#/lib/server/pos";
import { cn, formatCurrencyIDR } from "#/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarcodeIcon,
  CalculatorIcon,
  CameraIcon,
  Clock2Icon,
  CoinsIcon,
  ExpandIcon,
  ImageIcon,
  RotateCcwIcon,
  ShoppingCartIcon,
  TicketCheckIcon,
  User2Icon,
  MinusIcon,
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  XIcon,
  CheckIcon,
  TagIcon,
  StickyNoteIcon,
  MapPinIcon,
  PercentIcon,
  DollarSignIcon,
  ScanBarcodeIcon,
  FullscreenIcon,
  MinimizeIcon,
  ChevronDownIcon,
  SearchIcon,
  ReceiptIcon,
  BanknoteIcon,
  CreditCardIcon,
  QrCodeIcon,
  WalletIcon,
  ArrowLeftIcon,
  HashIcon,
  ScaleIcon,
  LayersIcon,
  AlertTriangleIcon,
  StoreIcon,
  SparklesIcon,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { getCustomersFn } from "#/lib/server/customers";
import { CustomButton } from "./-components/button";
import { useConfirmDialog } from "./-components/confirm-dialog";
import {
  PosProvider,
  usePosDispatch,
  usePosState,
} from "./-components/use-pos";
import { ProductGrid } from "./-components/products-grid";
import { CartItems } from "./-components/cart-items";
import { Header } from "./-components/header";
import { OtherCostSection } from "./-components/other-cost-section";
import { SummarySection } from "./-components/summary-section";
import { PaymentActions } from "./-components/payment-actions";
import { PaymentDialog } from "./-components/payment-dialog";
import { getPaymentMethodsFn } from "#/lib/server/payment-methods";

export const Route = createFileRoute("/_authed/pos-terminal/")({
  component: RouteComponent,
  loader: async () => {
    const categories = await getCategoriesFn();
    const products = await getPosProductsFn();
    const customers = await getCustomersFn();
    const paymentMethods = await getPaymentMethodsFn();

    // const promotions =
    return {
      categories: categories?.data || [],
      products: products?.data || [],
      customers: customers?.data || [],
      paymentMethods: paymentMethods?.data || [],
    };
  },
});

// ─── Mock Data ────────────────────────────────────────────────────────

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", name: "Pelanggan Umum", phone: "-", email: "-", points: 0 },
  {
    id: "2",
    name: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@email.com",
    points: 150,
  },
  {
    id: "3",
    name: "Ani Wijaya",
    phone: "0813-4567-8901",
    email: "ani@email.com",
    points: 320,
  },
  {
    id: "4",
    name: "Dedi Kurniawan",
    phone: "0814-5678-9012",
    email: "dedi@email.com",
    points: 75,
  },
  {
    id: "5",
    name: "Siti Rahayu",
    phone: "0815-6789-0123",
    email: "siti@email.com",
    points: 210,
  },
];

const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "1",
    name: "Promo Pagi",
    description: "Diskon 20% untuk kopi sebelum jam 11",
    type: "percent",
    value: 20,
    target: "category",
    target_category_id: "coffee",
  },
  {
    id: "2",
    name: "Happy Hour",
    description: "Beli 2 gratis 1 minuman",
    type: "bogo",
    value: 33.33,
    target: "category",
    target_category_id: "drinks",
  },
  {
    id: "3",
    name: "Reward Loyal",
    description: "Potongan Rp5.000 untuk transaksi di atas Rp25.000",
    type: "fixed",
    value: 5000,
    target: "transaction",
    min_amount: 25000,
  },
  {
    id: "4",
    name: "Weekend Brunch",
    description: "Diskon 15% untuk makanan",
    type: "percent",
    value: 15,
    target: "category",
    target_category_id: "food",
  },
  {
    id: "5",
    name: "Diskon Pelajar",
    description: "Diskon 10% untuk total transaksi",
    type: "percent",
    value: 10,
    target: "transaction",
  },
];

// ─── Custom Styles ───────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────

function RouteComponent() {
  const { categories, products, customers } = Route.useLoaderData();

  const dispatch = usePosDispatch();
  const state = usePosState();

  // ── State ─────────────────────────────────────────────────────────
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [otherCosts, setOtherCosts] = useState<OtherCost[]>([]);
  const [activePromotions, setActivePromotions] = useState<string[]>([]);

  const [isModeScanBarcode, setIsModeScanBarcode] = useState(false);
  const [isModeScanCamera, setIsModeScanCamera] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile product dialog
  const [mobileProduct, setMobileProduct] = useState<Product | null>(null);
  const [mobileQty, setMobileQty] = useState("1");

  // Edit item dialog
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editDiscountType, setEditDiscountType] = useState<"percent" | "fixed">(
    "percent",
  );
  const [editDiscountValue, setEditDiscountValue] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editLocationId, setEditLocationId] = useState<string | null>(null);

  // Customer dialog
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // Promotion dialog
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  // Calculator dialog
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Payment dialog
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "method" | "amount" | "processing" | "success"
  >("method");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "cash" | "card" | "qris" | null
  >(null);
  const [paidAmount, setPaidAmount] = useState("");

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Barcode scanner ref
  const barcodeBufferRef = useRef("");
  const barcodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // ── Computed Values ───────────────────────────────────────────────

  const filteredProducts = products.filter((p: Product) => {
    const matchesCategory =
      !selectedCategory ||
      p.productCategories?.some(
        (pc: { category: Category }) => pc.category.id === selectedCategory.id,
      );
    const matchesSearch =
      !searchQuery ||
      p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const subtotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.unit_price * item.quantity;
    const itemDiscount =
      item.discount_type === "percent"
        ? itemTotal * (item.discount_value / 100)
        : item.discount_type === "fixed"
          ? Math.min(item.discount_value * item.quantity, itemTotal)
          : 0;
    return sum + Math.max(0, itemTotal - itemDiscount);
  }, 0);

  const otherCostsTotal = otherCosts.reduce((sum, c) => sum + c.amount, 0);
  const tax = (subtotal + otherCostsTotal) * 0.085;

  let promoDiscount = 0;
  activePromotions.forEach((pid) => {
    const promo = MOCK_PROMOTIONS.find((p) => p.id === pid);
    if (!promo) return;

    if (promo.target === "transaction") {
      const totalBeforePromo = subtotal + otherCostsTotal;
      if (!promo.min_amount || totalBeforePromo >= promo.min_amount) {
        if (promo.type === "percent")
          promoDiscount += totalBeforePromo * (promo.value / 100);
        else if (promo.type === "fixed") promoDiscount += promo.value;
      }
    } else if (promo.target === "category" && promo.target_category_id) {
      const catTotal = cartItems
        .filter((item) => {
          const product = products.find(
            (p: Product) => p.sku_id === item.product_sku_id,
          );
          return product?.productCategories?.some(
            (pc: { category: Category }) =>
              pc.category.id === promo.target_category_id,
          );
        })
        .reduce((sum, item) => {
          const itemTotal = item.unit_price * item.quantity;
          const itemDiscount =
            item.discount_type === "percent"
              ? itemTotal * (item.discount_value / 100)
              : item.discount_type === "fixed"
                ? Math.min(item.discount_value * item.quantity, itemTotal)
                : 0;
          return sum + Math.max(0, itemTotal - itemDiscount);
        }, 0);

      if (promo.type === "percent")
        promoDiscount += catTotal * (promo.value / 100);
      else if (promo.type === "fixed")
        promoDiscount += Math.min(promo.value, catTotal);
    }
  });

  const total = Math.max(0, subtotal + otherCostsTotal + tax - promoDiscount);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const change = Math.max(0, parseFloat(paidAmount || "0") - total);

  // ── Barcode Scanner ───────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key >= "0" && e.key <= "9") {
        barcodeBufferRef.current += e.key;
        if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
        barcodeTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 100);
      } else if (e.key === "Enter" && barcodeBufferRef.current.length >= 8) {
        processBarcode(barcodeBufferRef.current);
        barcodeBufferRef.current = "";
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, cartItems]);

  const processBarcode = (code: string) => {
    const product = products.find(
      (p: Product) => p.barcode === code || p.sku_id === code,
    );
    if (product) {
      addProductToCart(product);
      toast.success(`Barcode: ${product.display_name}`);
    } else {
      toast.error("Produk tidak ditemukan");
    }
  };

  // ── Camera Scanner ────────────────────────────────────────────────

  useEffect(() => {
    if (isModeScanCamera) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          const cams = devices.map((d) => ({ id: d.id, label: d.label }));
          setAvailableCameras(cams);
          if (cams.length > 0 && !selectedCamera) {
            setSelectedCamera(cams[0].id);
          }
        })
        .catch(() => {
          toast.error("Tidak dapat mengakses kamera");
          setIsModeScanCamera(false);
        });
    }
  }, [isModeScanCamera]);

  const startCameraScan = useCallback(() => {
    if (!selectedCamera || !isModeScanCamera) return;

    const scanner = new Html5Qrcode("camera-reader");
    html5QrCodeRef.current = scanner;

    scanner
      .start(
        selectedCamera,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          processBarcode(decodedText);
          stopCameraScan();
          setIsModeScanCamera(false);
        },
        () => {},
      )
      .catch(() => {
        toast.error("Gagal memulai kamera");
      });
  }, [selectedCamera, isModeScanCamera]);

  useEffect(() => {
    if (isModeScanCamera && selectedCamera) {
      const timer = setTimeout(startCameraScan, 300);
      return () => {
        clearTimeout(timer);
        stopCameraScan();
      };
    }
  }, [isModeScanCamera, selectedCamera, startCameraScan]);

  const stopCameraScan = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
        })
        .catch(() => {});
    }
  };

  const closeCameraScanner = () => {
    stopCameraScan();
    setIsModeScanCamera(false);
    setSelectedCamera(null);
  };

  // ── Fullscreen ────────────────────────────────────────────────────

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Cart Actions ──────────────────────────────────────────────────

  const addProductToCart = (product: Product, qty?: number) => {
    const existing = cartItems.find(
      (ci) => ci.product_sku_id === product.sku_id,
    );
    const existingQuantity = existing?.quantity || 0;
    const addQty = qty ?? (product.unit.type === "decimal" ? 0.1 : 1);

    if (
      product.stock_quantity <= existingQuantity &&
      product.unit.type === "integer"
    ) {
      toast.error("Stok produk tidak mencukupi.");
      return;
    }

    const locations =
      product.stock_locations?.length > 0
        ? product.stock_locations
        : [
            {
              id: "default",
              name: "Gudang Utama",
              quantity: product.stock_quantity,
              is_primary: true,
            },
          ];

    if (existing) {
      setCartItems(
        cartItems.map((ci) =>
          ci.product_sku_id === product.sku_id
            ? { ...ci, quantity: ci.quantity + addQty }
            : ci,
        ),
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          product_name: product.display_name,
          product_sku_id: product.sku_id,
          image: product.sku_image_path,
          note: "",
          quantity: addQty,
          discount_type: null,
          discount_value: 0,
          selected_location_id:
            locations.find((l: StockLocation) => l.is_primary)?.id ||
            locations[0]?.id ||
            null,
          locations,
          unit_price: product.price,
          unit: product.unit,
        },
      ]);
    }
    toast.success(`${product.display_name} ditambahkan`);
    setMobileProduct(null);
    setMobileQty("1");
  };

  const updateQuantity = (skuId: string, newQuantity: string) => {
    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty < 0) return;

    const item = cartItems.find((ci) => ci.product_sku_id === skuId);
    if (!item) return;

    if (
      item.unit.type === "integer" &&
      qty >
        item.locations.find((l) => l.id === item.selected_location_id)
          ?.quantity!
    ) {
      toast.error("Melebihi stok tersedia");
      return;
    }

    if (qty === 0) {
      setCartItems(cartItems.filter((ci) => ci.product_sku_id !== skuId));
    } else {
      setCartItems(
        cartItems.map((ci) =>
          ci.product_sku_id === skuId ? { ...ci, quantity: qty } : ci,
        ),
      );
    }
  };

  const removeFromCart = (skuId: string) => {
    setCartItems(cartItems.filter((ci) => ci.product_sku_id !== skuId));
    toast.info("Item dihapus");
  };

  const clearCart = () => {
    setCartItems([]);
    setOtherCosts([]);
    setActivePromotions([]);
    setCustomer(null);
    setIsResetConfirmOpen(false);
    toast.info("Keranjang dikosongkan");
  };

  // ── Mobile Product Dialog ─────────────────────────────────────────

  const openMobileProduct = (product: Product) => {
    setMobileProduct(product);
    setMobileQty(product.unit.type === "decimal" ? "0.1" : "1");
  };

  // ── Edit Item Dialog ──────────────────────────────────────────────

  const openEditItem = (item: CartItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity.toString());
    setEditDiscountType(item.discount_type || "percent");
    setEditDiscountValue(item.discount_value?.toString() || "");
    setEditNote(item.note || "");
    setEditLocationId(item.selected_location_id);
  };

  const saveEditItem = () => {
    if (!editingItem) return;

    const qty = parseFloat(editQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Kuantitas tidak valid");
      return;
    }

    if (editingItem.unit.type === "integer") {
      const loc = editingItem.locations.find((l) => l.id === editLocationId);
      if (loc && qty > loc.quantity) {
        toast.error("Melebihi stok lokasi");
        return;
      }
    }

    setCartItems(
      cartItems.map((ci) => {
        if (ci.product_sku_id === editingItem.product_sku_id) {
          return {
            ...ci,
            quantity: qty,
            discount_type: editDiscountValue ? editDiscountType : null,
            discount_value: parseFloat(editDiscountValue) || 0,
            note: editNote || null,
            selected_location_id: editLocationId,
          };
        }
        return ci;
      }),
    );

    setEditingItem(null);
    toast.success("Item diperbarui");
  };

  // ── Other Costs ───────────────────────────────────────────────────

  const addOtherCost = () => {
    const id = `cost-${Date.now()}`;
    setOtherCosts([...otherCosts, { id, name: "Biaya Lain", amount: 0 }]);
  };

  const updateOtherCost = (
    id: string,
    field: "name" | "amount",
    value: string | number,
  ) => {
    setOtherCosts(
      otherCosts.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            [field]:
              field === "amount" ? parseFloat(value as string) || 0 : value,
          };
        }
        return c;
      }),
    );
  };

  const removeOtherCost = (id: string) => {
    setOtherCosts(otherCosts.filter((c) => c.id !== id));
  };

  // ── Promotions ────────────────────────────────────────────────────

  const togglePromotion = (promoId: string) => {
    setActivePromotions((prev) => {
      if (prev.includes(promoId)) {
        return prev.filter((id) => id !== promoId);
      }
      return [...prev, promoId];
    });
  };

  const clearPromotions = () => setActivePromotions([]);

  // ── Customer ─────────────────────────────────────────────────────

  const selectCustomer = (c: Customer) => {
    setCustomer(c);
    setIsCustomerOpen(false);
    toast.success(`Pelanggan: ${c.name}`);
  };

  const filteredCustomers = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch),
  );

  // ── Payment ───────────────────────────────────────────────────────

  const openPayment = () => {
    if (cartItems.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    setPaymentStep("method");
    setSelectedPaymentMethod(null);
    setPaidAmount("");
    setIsPaymentOpen(true);
  };

  const selectPaymentMethod = (method: "cash" | "card" | "qris") => {
    setSelectedPaymentMethod(method);
    if (method === "cash") {
      setPaymentStep("amount");
    } else {
      setPaymentStep("processing");
      setTimeout(() => setPaymentStep("success"), 2500);
    }
  };

  const processCashPayment = () => {
    const paid = parseFloat(paidAmount);
    if (isNaN(paid) || paid < total) {
      toast.error("Jumlah bayar kurang dari total");
      return;
    }
    setPaymentStep("processing");
    setTimeout(() => setPaymentStep("success"), 1500);
  };

  const closePayment = () => {
    setIsPaymentOpen(false);
    if (paymentStep === "success") {
      setCartItems([]);
      setOtherCosts([]);
      setActivePromotions([]);
      setCustomer(null);
      setPaidAmount("");
    }
  };

  // ── Calculator ────────────────────────────────────────────────────

  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcExpression, setCalcExpression] = useState("");
  const [calcNewNumber, setCalcNewNumber] = useState(true);

  const calcNum = (num: string) => {
    if (calcNewNumber) {
      setCalcDisplay(num);
      setCalcNewNumber(false);
    } else {
      setCalcDisplay(calcDisplay === "0" ? num : calcDisplay + num);
    }
  };

  const calcOp = (op: string) => {
    setCalcExpression(calcDisplay + " " + op + " ");
    setCalcNewNumber(true);
  };

  const calcEquals = () => {
    try {
      const result = eval(calcExpression + calcDisplay);
      setCalcDisplay(String(Number(result.toFixed(2))));
      setCalcExpression("");
      setCalcNewNumber(true);
    } catch {
      setCalcDisplay("Error");
    }
  };

  const calcClear = () => {
    setCalcDisplay("0");
    setCalcExpression("");
    setCalcNewNumber(true);
  };

  const calcBackspace = () => {
    if (calcDisplay.length > 1) {
      setCalcDisplay(calcDisplay.slice(0, -1));
    } else {
      setCalcDisplay("0");
    }
  };

  // ── Render Helpers ────────────────────────────────────────────────

  const formatQuantity = (qty: number, unitType: string) => {
    if (unitType === "integer") return Math.round(qty).toString();
    return qty.toFixed(2).replace(/\.?0+$/, "");
  };

  const getStepValue = (unitType: string) => {
    return unitType === "integer" ? "1" : "0.1";
  };

  const resetDialog = useConfirmDialog({
    onConfirm: () => {
      clearCart();
    },
    title: "Konfirmasi Reset",
    description:
      "Yakin ingin mengosongkan semua item di keranjang? Tindakan ini tidak dapat dibatalkan.",
  });

  // ── Render ────────────────────────────────────────────────────────
  //
  return (
    <PosProvider>
      <div className="fixed inset-0 w-screen h-screen bg-slate-50 z-50 flex">
        {/* ═══ RESET CONFIRMATION DIALOG ═══ */}
        <resetDialog.Dialog />

        {/* ═══ MOBILE PRODUCT DIALOG (Bottom Sheet) ═══ */}
        <Dialog
          open={!!mobileProduct}
          onOpenChange={(open) => !open && setMobileProduct(null)}
        >
          <DialogContent className="sm:max-w-md rounded-t-3xl sm:rounded-3xl border-0 shadow-2xl p-0 gap-0 overflow-hidden">
            {mobileProduct && (
              <>
                <div className="relative h-48 bg-slate-100">
                  {mobileProduct.sku_image_path ? (
                    <img
                      src={mobileProduct.sku_image_path}
                      alt=""
                      className="w-full h-full object-contain p-6"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-slate-300" />
                    </div>
                  )}
                  <CustomButton
                    variant="ghost"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur"
                    onClick={() => setMobileProduct(null)}
                  >
                    <XIcon className="w-4 h-4" />
                  </CustomButton>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      {mobileProduct.product_name}
                    </p>
                    <h3 className="text-xl font-bold text-slate-800">
                      {mobileProduct.sku_name || mobileProduct.display_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={cn("text-2xl font-bold text-emerald-600")}
                      >
                        {formatCurrencyIDR(mobileProduct.price)}
                      </span>
                      <span className="text-sm text-slate-400">
                        / {mobileProduct.unit.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                      Stok tersedia:
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 border-0"
                    >
                      {mobileProduct.stock_quantity} {mobileProduct.unit.name}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Kuantitas
                    </Label>
                    <div className="flex items-center gap-3">
                      <CustomButton
                        variant="primary"
                        className="w-12 h-12 rounded-xl"
                        onClick={() => {
                          const step =
                            mobileProduct.unit.type === "integer" ? 1 : 0.1;
                          const current = parseFloat(mobileQty) || 0;
                          setMobileQty(Math.max(0, current - step).toString());
                        }}
                      >
                        <MinusIcon className="w-5 h-5" />
                      </CustomButton>
                      <Input
                        type="number"
                        step={getStepValue(mobileProduct.unit.type)}
                        value={mobileQty}
                        onChange={(e) => setMobileQty(e.target.value)}
                        className={cn(
                          "flex-1 h-12 text-center text-xl font-bold rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                        )}
                      />
                      <CustomButton
                        variant="secondary"
                        className="w-12 h-12 rounded-xl"
                        onClick={() => {
                          const step =
                            mobileProduct.unit.type === "integer" ? 1 : 0.1;
                          const current = parseFloat(mobileQty) || 0;
                          setMobileQty((current + step).toString());
                        }}
                      >
                        <PlusIcon className="w-5 h-5" />
                      </CustomButton>
                    </div>
                  </div>

                  <CustomButton
                    variant="primary"
                    className="w-full py-4 text-lg gap-2"
                    onClick={() =>
                      addProductToCart(
                        mobileProduct,
                        parseFloat(mobileQty) || 1,
                      )
                    }
                  >
                    <PlusIcon className="w-5 h-5" />
                    Tambah ke Keranjang
                  </CustomButton>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ═══ CAMERA SCANNER DIALOG ═══ */}
        <Dialog
          open={isModeScanCamera}
          onOpenChange={(open) => !open && closeCameraScanner()}
        >
          <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-800">
                <CameraIcon className="w-5 h-5 text-emerald-500" />
                Scan Barcode dengan Kamera
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Pilih kamera dan arahkan barcode ke area scan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Select
                value={selectedCamera || ""}
                onValueChange={setSelectedCamera}
              >
                <SelectTrigger className="h-12 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500">
                  <SelectValue placeholder="Pilih kamera..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableCameras.map((cam) => (
                      <SelectItem key={cam.id} value={cam.id}>
                        {cam.label || `Kamera ${cam.id.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div
                className="relative bg-slate-100 rounded-2xl overflow-hidden"
                style={{ minHeight: 300 }}
              >
                <div id="camera-reader" className="w-full" />
                {!selectedCamera && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-400">Pilih kamera untuk memulai</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ═══ EDIT ITEM DIALOG ═══ */}
        <Dialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        >
          <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl p-0 gap-0 max-h-[90vh] overflow-hidden">
            {editingItem && (
              <>
                <div className="p-6 border-b bg-slate-50/50">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-800">
                      <PencilIcon className="w-5 h-5 text-emerald-500" />
                      Edit Item
                    </DialogTitle>
                  </DialogHeader>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    {editingItem.image ? (
                      <img
                        src={editingItem.image}
                        alt=""
                        className="w-16 h-16 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800">
                        {editingItem.product_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatCurrencyIDR(editingItem.unit_price)} /{" "}
                        {editingItem.unit.name}
                      </p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <HashIcon className="w-4 h-4 text-slate-400" />
                      Kuantitas ({editingItem.unit.name})
                    </Label>
                    <div className="flex items-center gap-3">
                      <CustomButton
                        variant="secondary"
                        className="w-14 h-14 rounded-2xl"
                        onClick={() => {
                          const step =
                            editingItem.unit.type === "integer" ? 1 : 0.1;
                          const current = parseFloat(editQuantity) || 0;
                          setEditQuantity(
                            Math.max(0, current - step).toString(),
                          );
                        }}
                      >
                        <MinusIcon className="w-5 h-5" />
                      </CustomButton>
                      <Input
                        type="number"
                        step={getStepValue(editingItem.unit.type)}
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className={cn(
                          "flex-1 h-14 text-center text-2xl font-bold rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                        )}
                      />
                      <CustomButton
                        variant="secondary"
                        className="w-14 h-14 rounded-2xl"
                        onClick={() => {
                          const step =
                            editingItem.unit.type === "integer" ? 1 : 0.1;
                          const current = parseFloat(editQuantity) || 0;
                          setEditQuantity((current + step).toString());
                        }}
                      >
                        <PlusIcon className="w-5 h-5" />
                      </CustomButton>
                    </div>
                    <p className="text-xs text-slate-400">
                      Tipe:{" "}
                      {editingItem.unit.type === "integer"
                        ? "Bilangan bulat"
                        : "Desimal"}
                    </p>
                  </div>

                  {/* Stock Location */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      Lokasi Stok
                    </Label>
                    <Select
                      value={editLocationId || ""}
                      onValueChange={(v) => setEditLocationId(v || null)}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500">
                        <SelectValue placeholder="Pilih lokasi..." />
                      </SelectTrigger>
                      <SelectContent>
                        {editingItem.locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            <div className="flex items-center justify-between w-full gap-6">
                              <span>{loc.name}</span>
                              <div className="flex items-center gap-2">
                                {loc.is_primary && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    Utama
                                  </Badge>
                                )}
                                <span className="text-xs text-slate-500">
                                  {loc.quantity} unit
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Discount */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-slate-400" />
                      Diskon
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <CustomButton
                        variant={
                          editDiscountType === "percent"
                            ? "primary"
                            : "secondary"
                        }
                        className="py-3 rounded-2xl"
                        onClick={() => setEditDiscountType("percent")}
                      >
                        <PercentIcon className="w-4 h-4 mr-2 inline" />
                        Persen
                      </CustomButton>
                      <CustomButton
                        variant={
                          editDiscountType === "fixed" ? "primary" : "secondary"
                        }
                        className="py-3 rounded-2xl"
                        onClick={() => setEditDiscountType("fixed")}
                      >
                        <DollarSignIcon className="w-4 h-4 mr-2 inline" />
                        Tetap
                      </CustomButton>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                        {editDiscountType === "percent" ? "%" : "Rp"}
                      </span>
                      <Input
                        type="number"
                        value={editDiscountValue}
                        onChange={(e) => setEditDiscountValue(e.target.value)}
                        placeholder="0"
                        className={cn(
                          "pl-12 h-14 text-xl font-bold rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                        )}
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <StickyNoteIcon className="w-4 h-4 text-slate-400" />
                      Catatan
                    </Label>
                    <Textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Contoh: Tidak pakai gula, extra ice..."
                      rows={3}
                      className={cn(
                        "resize-none rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500",
                      )}
                    />
                  </div>
                </div>

                <div className="p-6 border-t bg-slate-50/50 flex gap-3">
                  <CustomButton
                    variant="secondary"
                    className="flex-1 py-4"
                    onClick={() => setEditingItem(null)}
                  >
                    Batal
                  </CustomButton>
                  <CustomButton
                    variant="primary"
                    className="flex-1 py-4 gap-2"
                    onClick={saveEditItem}
                  >
                    <CheckIcon className="w-5 h-5" />
                    Simpan
                  </CustomButton>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ═══ CUSTOMER DIALOG ═══ */}
        <Dialog open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
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

            <ScrollArea className="h-[320px]">
              <div className="space-y-2 pr-2">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all",
                      customer?.id === c.id
                        ? "bg-emerald-50 ring-2 ring-emerald-200"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{c.name}</p>
                      <p className="text-sm text-slate-400">{c.phone}</p>
                    </div>
                    {c.points ? (
                      <Badge className="bg-amber-100 text-amber-700 border-0 hover:bg-amber-100">
                        {c.points} poin
                      </Badge>
                    ) : null}
                    {customer?.id === c.id && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* ═══ PROMOTION DIALOG ═══ */}
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
                                isActive
                                  ? "text-emerald-700"
                                  : "text-slate-700",
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
                          {isActive && (
                            <CheckIcon className="w-4 h-4 text-white" />
                          )}
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

        {/* ═══ CALCULATOR DIALOG ═══ */}
        <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
          <DialogContent className="max-w-sm rounded-3xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-800">
                <CalculatorIcon className="w-5 h-5 text-emerald-500" />
                Kalkulator
              </DialogTitle>
            </DialogHeader>

            <div className="bg-slate-50 rounded-2xl p-5 mb-5 text-right">
              <div className="text-sm text-slate-400 mb-1 min-h-[20px]">
                {calcExpression}
              </div>
              <div className="text-4xl font-bold text-slate-800">
                {calcDisplay}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <CustomButton
                variant="danger"
                className="h-14 rounded-2xl"
                onClick={calcClear}
              >
                C
              </CustomButton>
              <CustomButton
                variant="secondary"
                className="h-14 rounded-2xl"
                onClick={() => calcOp("/")}
              >
                ÷
              </CustomButton>
              <CustomButton
                variant="secondary"
                className="h-14 rounded-2xl"
                onClick={() => calcOp("*")}
              >
                ×
              </CustomButton>
              <CustomButton
                variant="secondary"
                className="h-14 rounded-2xl"
                onClick={calcBackspace}
              >
                <XIcon className="w-5 h-5 mx-auto" />
              </CustomButton>

              {[7, 8, 9].map((n) => (
                <CustomButton
                  key={n}
                  variant="ghost"
                  className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                  onClick={() => calcNum(String(n))}
                >
                  {n}
                </CustomButton>
              ))}
              <CustomButton
                variant="secondary"
                className="h-14 rounded-2xl"
                onClick={() => calcOp("-")}
              >
                -
              </CustomButton>

              {[4, 5, 6].map((n) => (
                <CustomButton
                  key={n}
                  variant="ghost"
                  className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                  onClick={() => calcNum(String(n))}
                >
                  {n}
                </CustomButton>
              ))}
              <CustomButton
                variant="secondary"
                className="h-14 rounded-2xl"
                onClick={() => calcOp("+")}
              >
                +
              </CustomButton>

              {[1, 2, 3].map((n) => (
                <CustomButton
                  key={n}
                  variant="ghost"
                  className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                  onClick={() => calcNum(String(n))}
                >
                  {n}
                </CustomButton>
              ))}
              <CustomButton
                variant="primary"
                className="h-14 rounded-2xl row-span-2"
                onClick={calcEquals}
              >
                =
              </CustomButton>

              <CustomButton
                variant="ghost"
                className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50 col-span-2"
                onClick={() => calcNum("0")}
              >
                0
              </CustomButton>
              <CustomButton
                variant="ghost"
                className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                onClick={() => calcNum(".")}
              >
                .
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* ═══ PAYMENT DIALOG ═══ */}
        <PaymentDialog />

        <div className="flex flex-col h-full w-full min-w-0 bg-slate-50">
          {/* ─── Header ─── */}
          <Header />

          {/* ─── Categories ─── */}

          {/* ─── Products Grid ─── */}
          <ProductGrid />

          {/* ─── Bottom Bar ─── */}
          <div className="p-3 border-t border-slate-100 bg-white/80 backdrop-blur-sm shrink-0 flex gap-2">
            <CustomButton
              variant="secondary"
              className="flex-1 py-3 gap-2 text-sm"
              onClick={() => setIsCalcOpen(true)}
            >
              <CalculatorIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Kalkulator</span>
            </CustomButton>

            <CustomButton
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
            </CustomButton>
          </div>
        </div>

        <div className="w-full sm:w-[420px] h-full border-l border-slate-100 flex flex-col bg-white shrink-0 fixed sm:relative inset-0 z-40 sm:z-auto translate-x-full sm:translate-x-0 transition-transform duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 p-3 sm:p-4 shrink-0 bg-white/80 backdrop-blur-sm">
            <CustomButton
              variant="secondary"
              className="h-9 px-3 gap-2 text-sm rounded-xl"
              onClick={() => setIsCustomerOpen(true)}
            >
              <User2Icon className="w-4 h-4" />
              <span className="max-w-[100px] truncate">
                {customer?.name ?? "Pelanggan Umum"}
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
    </PosProvider>
  );
}
