import type { PaymentMethod } from "#/generated/prisma/client";
import { createContext, useContext, useReducer, type ReactNode } from "react";
import { toast } from "sonner";

type StockLocation = {
  id: string;
  name: string;
  is_primary: boolean;
  quantity: number;
};

type CartItem = {
  product_sku_id: string;
  product_image_path: null | string;
  product_display_name: string;

  unit: {
    id: string;
    type: string;
    name: string;
  };

  stock_quantity: number;
  quantity: number;
  price: number;
  subtotal: number;

  selected_stock_location_id: null | string;
  stock_locations: StockLocation[];

  discount_type: null | "percent" | "fixed";
  discount_value: number;
  discount_amount: number;
  discount_total: number;
  price_after_discount: number;

  note: string | null;
};

type OtherCostItem = {
  id: string;
  note: string;
  amount: number;
};

type PosAction =
  | {
      type: "addToCart";
      payload: CartItem;
    }
  | {
      type: "deleteCartItem";
      payload: string;
    }
  | {
      type: "updateCartItemQuantity";
      payload: {
        newQty: number;
        product_sku_id: string;
      };
    }
  | {
      type: "updateCartItemNote";
      payload: {
        product_sku_id: string;
        note: string;
      };
    }
  | {
      type: "updateCartItemDiscountType";
      payload: {
        product_sku_id: string;
        discountType: "percent" | "fixed" | null;
      };
    }
  | {
      type: "updateCartItemDiscountValue";
      payload: {
        product_sku_id: string;
        discountValue: number;
      };
    }
  | {
      type: "updateCartItemPrice";
      payload: {
        product_sku_id: string;
        price: number;
      };
    }
  | {
      type: "updateCartItemSelectedStockLocation";
      payload: {
        product_sku_id: string;
        stock_location_id: string | null;
      };
    }
  | {
      type: "saveCartEditItem";
    }
  | {
      type: "cancelCartEditItem";
    }
  | {
      type: "setProductSearchKeyword";
      payload: string;
    }
  | {
      type: "setScanMode";
      payload: "none" | "barcode_scanner" | "camera_scanner";
    }
  | {
      type: "clearCart";
    }
  | {
      type: "addOtherCost";
    }
  | {
      type: "updateAmountOtherCost";
      payload: {
        amount: number;
        id: string;
      };
    }
  | {
      type: "updateNoteOtherCost";
      payload: {
        note: string;
        id: string;
      };
    }
  | {
      type: "removeOtherCost";
      payload: {
        id: string;
      };
    }
  | {
      type: "changeDialogMode";
      payload: {
        mode:
          | "none"
          | "selecting_customer"
          | "payment"
          | "selecting_promos"
          | "open_calculator";
      };
    }
  | {
      type: "changePaymentStep";
      payload: {
        step:
          | "selecting_payment_method"
          | "input_amount"
          | "processing"
          | "success"
          | "failed";
      };
    }
  | {
      type: "changePaymentMethod";
      payload: PaymentMethod;
    }
  | {
      type: "openDialogUpdateCartItem";
      payload: {
        sku_id: string;
      };
    }
  | {
      type: "closeDialogUpdateCartItem";
    }
  | {
      type: "changeSelectedCustomer";
      payload: {
        id: null | string;
      };
    };

type PosData = {
  carts: CartItem[];
  cartItemBeingEdited: null | CartItem;
  isOpenEditingDialog: boolean;

  otherCosts: OtherCostItem[];
  subtotal: number;
  otherCostTotal: number;
  discountTotal: null | number;
  total: number;

  payAmount: number;
  charge: number;

  searchProductKeyword: string;
  selectedCategory: string;
  selectedPaymentMethod: null | PaymentMethod;

  selectedCustomerId: null | string;

  mode: "none" | "barcode_scanner" | "camera_scanner";
  dialogMode:
    | "none"
    | "selecting_customer"
    | "payment"
    | "selecting_promos"
    | "open_calculator";

  paymentStep:
    | "selecting_payment_method"
    | "input_amount"
    | "processing"
    | "success"
    | "failed";
};

type PosStateContext = {
  addToCart: (item: CartItem) => void;
};

const initialState: PosData = {
  carts: [],
  otherCosts: [],
  selectedPaymentMethod: null,
  subtotal: 0,
  otherCostTotal: 0,
  discountTotal: null,
  total: 0,
  payAmount: 0,
  charge: 0,
  searchProductKeyword: "",
  selectedCategory: "",
  mode: "none",
  dialogMode: "none",
  paymentStep: "selecting_payment_method",
  cartItemBeingEdited: null,
  isOpenEditingDialog: false,
  selectedCustomerId: null,
};

const calculateSummary = (state: PosData): PosData => {
  const subtotal = state.carts.reduce((p, c) => p + c.subtotal, 0);
  const discountTotal = state.carts.reduce((p, c) => p + c.discount_total, 0);
  const otherCostsTotal = state.otherCosts.reduce((p, c) => p + c.amount, 0);
  const total = subtotal + otherCostsTotal;

  return {
    ...state,
    subtotal: subtotal,
    discountTotal: discountTotal,
    otherCostTotal: otherCostsTotal,
    total: total,
  };
};

const calculateCartItem = (item: CartItem): CartItem => {
  const discountAmount =
    item.discount_type === null
      ? 0
      : item.discount_type === "fixed"
        ? item.discount_value
        : item.price * (item.discount_value / 100);
  const priceAfterDiscount = item.price - discountAmount;
  const subtotal = item.quantity * priceAfterDiscount;
  const discountTotal = item.quantity * discountAmount;

  return {
    ...item,
    discount_amount: discountAmount,
    subtotal: subtotal,
    discount_total: discountTotal,
    price_after_discount: priceAfterDiscount,
  };
};

const reducer = (state: PosData, action: PosAction): PosData => {
  switch (action.type) {
    case "addToCart": {
      const product = action.payload;

      const existing = state.carts.find(
        (ci) => ci.product_sku_id === product.product_sku_id,
      );

      const existingQuantity = existing?.quantity || 0;
      const addQty = 1;

      if (existingQuantity + addQty > product.stock_quantity) {
        toast.error("Stok produk tidak mencukupi.", {
          position: "top-center",
        });
        return state;
      }

      if (existing) {
        const newCarts = state.carts.map((pi) => {
          if (pi.product_sku_id == existing.product_sku_id) {
            const newQty = pi.quantity + addQty;
            return calculateCartItem({
              ...pi,
              quantity: newQty,
            });
          }

          return pi;
        });

        return calculateSummary({
          ...state,
          carts: newCarts,
        });
      }

      const newCarts = [
        ...state.carts,
        calculateCartItem({
          ...product,
          quantity: 1,
          selected_stock_location_id:
            product.stock_locations.find((sl) => sl.is_primary === true)?.id ??
            null,
        }),
      ];

      return calculateSummary({
        ...state,
        carts: newCarts,
      });
    }

    case "deleteCartItem": {
      const sku_id = action.payload;
      return {
        ...state,
        carts: [...state.carts.filter((ci) => ci.product_sku_id !== sku_id)],
      };
    }

    case "updateCartItemQuantity": {
      const product_sku_id = action.payload.product_sku_id;
      let newQty = action.payload.newQty;

      const existing = state.carts.find(
        (ci) => ci.product_sku_id === product_sku_id,
      );

      if (!existing) {
        toast.error("produk tidak ditemukan didalam keranjang.", {
          position: "top-center",
        });
        return state;
      }

      if (newQty > existing.stock_quantity) {
        toast.error(
          `Stok produk tidak mencukupi. jumlah stock tersedia adalah: ${existing.stock_quantity} ${existing.unit.name}.`,
          {
            position: "top-center",
          },
        );
        return state;
      }

      if (newQty < 1) {
        const newCarts = state.carts.filter(
          (ci) => ci.product_sku_id !== product_sku_id,
        );

        return calculateSummary({
          ...state,
          carts: newCarts,
        });
      } else {
        const newCarts = state.carts.map((pi) => {
          if (pi.product_sku_id == existing.product_sku_id) {
            return calculateCartItem({
              ...pi,
              quantity: newQty,
            });
          }

          return pi;
        });

        return calculateSummary({
          ...state,
          carts: newCarts,
        });
      }
    }

    case "updateCartItemNote": {
      const id = action.payload.product_sku_id;
      const note = action.payload.note;

      const newCarts = state.carts.map((pi) => {
        if (pi.product_sku_id == id) {
          return {
            ...pi,
            note: note,
          };
        }

        return pi;
      });

      return {
        ...state,
        carts: newCarts,
      };
    }

    case "updateCartItemDiscountType": {
      const id = action.payload.product_sku_id;
      const discountType = action.payload.discountType;

      const newCarts = state.carts.map((pi) => {
        if (pi.product_sku_id == id) {
          return calculateCartItem({
            ...pi,
            discount_type: discountType,
            discount_value: 0,
          });
        }

        return pi;
      });

      return calculateSummary({
        ...state,
        carts: newCarts,
      });
    }

    case "updateCartItemDiscountValue": {
      const id = action.payload.product_sku_id;
      const discountValue = action.payload.discountValue;

      const newCarts = state.carts.map((pi) => {
        if (pi.product_sku_id == id) {
          return calculateCartItem({
            ...pi,
            discount_value: discountValue,
          });
        }

        return pi;
      });

      return calculateSummary({
        ...state,
        carts: newCarts,
      });
    }

    case "updateCartItemPrice": {
      const id = action.payload.product_sku_id;
      const price = action.payload.price;

      const newCarts = state.carts.map((pi) => {
        if (pi.product_sku_id == id) {
          return calculateCartItem({
            ...pi,
            price: price,
          });
        }

        return pi;
      });

      return calculateSummary({
        ...state,
        carts: newCarts,
      });
    }

    case "updateCartItemSelectedStockLocation": {
      const id = action.payload.product_sku_id;
      const stock_location_id = action.payload.stock_location_id;

      const newCarts = state.carts.map((pi) => {
        if (pi.product_sku_id == id) {
          return {
            ...pi,
            selected_stock_location_id: stock_location_id,
          };
        }

        return pi;
      });

      return calculateSummary({
        ...state,
        carts: newCarts,
      });
    }

    case "cancelCartEditItem": {
      if (state.cartItemBeingEdited === null) {
        return state;
      }

      const newCarts = state.carts.map((pi) => {
        if (pi.product_sku_id == state.cartItemBeingEdited!.product_sku_id) {
          return calculateCartItem({
            ...state.cartItemBeingEdited!,
          });
        }

        return pi;
      });

      return calculateSummary({
        ...state,
        carts: newCarts,
        isOpenEditingDialog: false,
        cartItemBeingEdited: null,
      });
    }

    case "saveCartEditItem": {
      return {
        ...state,
        isOpenEditingDialog: false,
        cartItemBeingEdited: null,
      };
    }

    case "setProductSearchKeyword": {
      const keyword = action.payload;

      return {
        ...state,
        searchProductKeyword: keyword,
      };
    }

    case "setScanMode": {
      const mode = action.payload;

      return {
        ...state,
        mode: mode,
      };
    }

    case "clearCart": {
      const newCarts: CartItem[] = [];
      return calculateSummary({
        ...state,
        carts: newCarts,
      });
    }

    case "addOtherCost": {
      return {
        ...state,
        otherCosts: [
          ...state.otherCosts,
          {
            id: crypto.randomUUID(),
            note: "",
            amount: 0,
          },
        ],
      };
    }

    case "updateAmountOtherCost": {
      const amount = action.payload.amount;
      const id = action.payload.id;

      const newCosts = state.otherCosts.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            amount: amount,
          };
        }
        return c;
      });

      return calculateSummary({
        ...state,
        otherCosts: newCosts,
      });
    }

    case "updateNoteOtherCost": {
      const note = action.payload.note;
      const id = action.payload.id;

      const newCosts = state.otherCosts.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            note: note,
          };
        }
        return c;
      });

      return {
        ...state,
        otherCosts: newCosts,
      };
    }

    case "removeOtherCost": {
      const id = action.payload.id;
      const newCosts = state.otherCosts.filter((c) => c.id !== id);
      return {
        ...state,
        otherCosts: newCosts,
      };
    }

    case "changeDialogMode": {
      const mode = action.payload.mode;

      if (mode === "payment") {
        if (state.carts.length == 0) {
          toast.error("Keranjang masih kosong.", {
            position: "top-center",
          });
          return state;
        }

        return {
          ...state,
          dialogMode: mode,
          paymentStep: "selecting_payment_method",
          selectedPaymentMethod: null,
        };
      }

      return {
        ...state,
        dialogMode: mode,
      };
    }

    case "changePaymentStep": {
      const step = action.payload.step;

      return {
        ...state,
        paymentStep: step,
      };
    }

    case "changePaymentMethod": {
      return {
        ...state,
        paymentStep: "input_amount",
        selectedPaymentMethod: action.payload,
      };
    }

    case "openDialogUpdateCartItem": {
      const sku_id = action.payload.sku_id;
      const item = state.carts.find((ci) => ci.product_sku_id == sku_id);
      if (!item) {
        toast.error("Item tidak ditemukan dikeranjang.", {
          position: "top-center",
        });
        return state;
      }

      return {
        ...state,
        isOpenEditingDialog: true,
        cartItemBeingEdited: item,
      };
    }

    case "closeDialogUpdateCartItem": {
      return {
        ...state,
        isOpenEditingDialog: false,
        cartItemBeingEdited: null,
      };
    }

    case "changeSelectedCustomer": {
      const id = action.payload.id;
      return {
        ...state,
        selectedCustomerId: state.selectedCustomerId === id ? null : id,
      };
    }

    default: {
      return state;
    }
  }
};

const PosStateContext = createContext<PosData>(initialState);
const PosDispatchContext = createContext<React.ActionDispatch<
  [PosAction]
> | null>(null);

type ProviderProps = {
  children: ReactNode;
};

const PosProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <PosStateContext.Provider value={state}>
      <PosDispatchContext.Provider value={dispatch}>
        {children}
      </PosDispatchContext.Provider>
    </PosStateContext.Provider>
  );
};

const usePosState = () => {
  return useContext(PosStateContext);
};

const usePosDispatch = () => {
  return useContext(PosDispatchContext)!;
};

export { PosProvider, usePosDispatch, usePosState };
