export const CUSTOMER_COOKIE = "student_shop_customer_id";

export type Product = {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
};

export type Customer = {
  customer_id: number;
  full_name: string;
  email: string;
  city: string;
  state: string;
  customer_segment: string;
  loyalty_tier: string;
  is_active: number;
  total_orders: number;
  lifetime_value: number;
  average_order: number;
  last_order_date: string | null;
};
