export const CUSTOMER_COOKIE = "student_shop_customer_id";

export type Customer = {
  customer_id: number;
  full_name: string;
  email: string;
  city: string;
  state: string;
  customer_segment: string;
  loyalty_tier: string;
  order_count: number;
  total_spent: number;
  average_order: number;
  last_order_date: string;
};