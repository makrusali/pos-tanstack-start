export type Customer = {
  id: string;
  name: string;
};

export type StockLocation = {
  id: string;
  name: string;
  quantity: number;
  is_primary: boolean;
};

export type Unit = {
  id: string;
  name: string;
  type: "integer" | "decimal";
};

export type CartItem = {
  product_sku_id: string;
  product_name: string;
  image: string | null;
  quantity: number;
  note: string | null;
  discount_type: "percent" | "fixed" | null;
  discount_value: number;
  selected_location_id: string | null;
  locations: StockLocation[];
  unit_price: number;
  unit: Unit;
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sku_id: string;
  display_name: string;
  sku_name: string | null;
  product_name: string;
  sku_image_path: string | null;
  stock_quantity: number;
  price: number;
  type: string;
  unit: Unit;
  productCategories: Array<{ category: Category }>;
  stock_locations: StockLocation[];
  barcode?: string;
};

export type OtherCost = {
  id: string;
  name: string;
  amount: number;
};

export type Promotion = {
  id: string;
  name: string;
  description: string;
  type: "percent" | "fixed" | "bogo";
  value: number;
  target: "transaction" | "category";
  target_category_id?: string | null;
  min_amount?: number | null;
};
