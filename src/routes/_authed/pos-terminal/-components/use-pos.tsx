import type { PaymentMethod } from "#/generated/prisma/client";
import { createContext, useContext, useReducer, type ReactNode } from "react";
import { toast } from "sonner";

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

  discount_type: null | "percent" | "fixed";
  discount_value: number;
  discount_amount: number;
  discount_total: number;

  note: string | null;
};

type Customer = {
  id: string;
  name: string;
  contact: string;
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
    };

type PosData = {
  carts: CartItem[];
  otherCosts: OtherCostItem[];
  customer: null | Customer;
  subtotal: number;
  otherCostTotal: number;
  discountTotal: null | number;
  total: number;

  pay_amount: number;
  charge: number;

  searchProductKeyword: string;
  selectedCategory: string;
  selectedPaymentMethod: null | PaymentMethod;

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
  customer: null,
  selectedPaymentMethod: null,
  subtotal: 0,
  otherCostTotal: 0,
  discountTotal: null,
  total: 0,
  pay_amount: 0,
  charge: 0,
  searchProductKeyword: "",
  selectedCategory: "",
  mode: "none",
  dialogMode: "none",
  paymentStep: "selecting_payment_method",
};

const calculateSummary = (state: PosData): PosData => {
  const subtotal = state.carts.reduce((p, c) => p + c.subtotal, 0);
  const discountTotal = state.carts.reduce((p, c) => p + c.discount_total, 0);
  const otherCostsTotal = state.otherCosts.reduce((p, c) => p + c.amount, 0);
  const total = subtotal + discountTotal + otherCostsTotal;

  return {
    ...state,
    subtotal: subtotal,
    discountTotal: discountTotal,
    otherCostTotal: otherCostsTotal,
    total: total,
  };
};

const calculateCartItem = ({
  price,
  quantity,
  discountValue,
  discountType,
}: {
  price: number;
  quantity: number;
  discountValue: number;
  discountType: "fixed" | "percent" | null;
}) => {
  const discountAmount =
    discountType === null
      ? 0
      : discountType == "fixed"
        ? price - discountValue
        : price * (discountValue / 100);
  const subtotal = quantity * (price - discountAmount);
  const discountTotal = quantity * discountAmount;

  return {
    subtotal,
    discountTotal,
    discountAmount,
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
        toast.error("Stok produk tidak mencukupi.");
        return state;
      }

      if (existing) {
        const newCarts = state.carts.map((pi) => {
          if (pi.product_sku_id == existing.product_sku_id) {
            const newQty = pi.quantity + addQty;
            const result = calculateCartItem({
              discountType: pi.discount_type,
              discountValue: pi.discount_value,
              price: pi.price,
              quantity: newQty,
            });

            return {
              ...pi,
              quantity: newQty,
              subtotal: result.subtotal,
              discount_amount: result.discountAmount,
              discount_total: result.discountTotal,
            };
          }

          return pi;
        });

        return calculateSummary({
          ...state,
          carts: newCarts,
        });
      }

      const result = calculateCartItem({
        discountType: product.discount_type,
        discountValue: product.discount_value,
        price: product.price,
        quantity: addQty,
      });

      const newCarts = [
        ...state.carts,
        {
          ...product,
          subtotal: result.subtotal,
          discount_amount: result.discountAmount,
          discount_total: result.discountTotal,
          quantity: 1,
        },
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
      const newQty = action.payload.newQty;

      const existing = state.carts.find(
        (ci) => ci.product_sku_id === product_sku_id,
      );

      if (!existing) {
        toast.error("produk tidak ditemukan didalam keranjang.");
        return state;
      }

      if (newQty > existing.stock_quantity) {
        toast.error("Stok produk tidak mencukupi.");
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
            const result = calculateCartItem({
              discountType: pi.discount_type,
              discountValue: pi.discount_value,
              price: pi.price,
              quantity: newQty,
            });

            return {
              ...pi,
              quantity: newQty,
              subtotal: result.subtotal,
              discount_amount: result.discountAmount,
              discount_total: result.discountTotal,
            };
          }

          return pi;
        });

        return calculateSummary({
          ...state,
          carts: newCarts,
        });
      }
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

      if (mode == "payment") {
        if (state.carts.length == 0) {
          toast.error("Keranjang masih kosong.");
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
