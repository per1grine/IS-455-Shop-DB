export const CUSTOMER_COOKIE = "student_shop_customer_id";

export type Customer = {
  customerId: number;
  fullName: string;
  email: string;
  city: string;
  state: string;
  segment: string;
  loyaltyTier: string;
  orderCount: number;
  totalSpent: number;
  averageOrder: number;
  lastOrderDate: string;
};

export type Product = {
  productId: number;
  name: string;
  category: string;
  price: number;
};

export type OrderSummary = {
  orderId: number;
  customerId: number;
  orderDateTime: string;
  total: number;
  paymentMethod: string;
  deviceType: string;
  priorityBucket: string;
  priorityScore: number;
};

export type OrderLine = {
  productId: number;
  productName: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderDetail = OrderSummary & {
  customerName: string;
  shippingState: string;
  billingZip: string;
  shippingZip: string;
  predictionReason: string;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  lines: OrderLine[];
};

export type WarehousePriorityItem = {
  orderId: number;
  customerName: string;
  customerState: string;
  orderDateTime: string;
  orderTotal: number;
  priorityBucket: string;
  priorityScore: number;
  estimatedShipHours: number;
  delayDays: number;
  carrier: string;
  predictionReason: string;
};

export const customers: Customer[] = [
  {
    customerId: 1,
    fullName: "Patricia Diallo",
    email: "patriciadiallo0@example.com",
    city: "Clayton",
    state: "CO",
    segment: "standard",
    loyaltyTier: "silver",
    orderCount: 14,
    totalSpent: 3218.44,
    averageOrder: 229.89,
    lastOrderDate: "2025-11-18 14:20:07"
  },
  {
    customerId: 2,
    fullName: "Juan Flores",
    email: "juanflores1@example.com",
    city: "Hudson",
    state: "CO",
    segment: "budget",
    loyaltyTier: "none",
    orderCount: 8,
    totalSpent: 941.72,
    averageOrder: 117.71,
    lastOrderDate: "2025-10-03 09:12:18"
  },
  {
    customerId: 3,
    fullName: "Mary Gonzalez",
    email: "marygonzalez2@example.com",
    city: "Oxford",
    state: "OH",
    segment: "budget",
    loyaltyTier: "gold",
    orderCount: 19,
    totalSpent: 6120.14,
    averageOrder: 322.11,
    lastOrderDate: "2025-12-02 19:44:55"
  }
];

export const products: Product[] = [
  { productId: 1, name: "Portable Tool Kit", category: "Garden", price: 49.01 },
  { productId: 2, name: "Premium Monitor", category: "Automotive", price: 286.27 },
  { productId: 3, name: "Lightweight Flashlight", category: "Books", price: 31.12 },
  { productId: 4, name: "Professional Sneakers", category: "Grocery", price: 4.73 },
  { productId: 5, name: "Premium Vitamins", category: "Sports", price: 57.22 },
  { productId: 6, name: "Compact Coffee Grinder", category: "Home", price: 78.4 }
];

export const orders: OrderDetail[] = [
  {
    orderId: 5000,
    customerId: 1,
    customerName: "Patricia Diallo",
    orderDateTime: "2025-11-18 14:20:07",
    total: 629.28,
    paymentMethod: "card",
    deviceType: "desktop",
    priorityBucket: "normal",
    priorityScore: 59,
    shippingState: "CO",
    billingZip: "28289",
    shippingZip: "28289",
    predictionReason: "Large basket with normal ship estimate.",
    subtotal: 568.44,
    shippingFee: 5,
    taxAmount: 55.84,
    lines: [
      {
        productId: 2,
        productName: "Premium Monitor",
        sku: "SKU-0002",
        category: "Automotive",
        quantity: 2,
        unitPrice: 286.27,
        lineTotal: 572.54
      }
    ]
  },
  {
    orderId: 4999,
    customerId: 1,
    customerName: "Patricia Diallo",
    orderDateTime: "2025-10-28 08:15:00",
    total: 186.9,
    paymentMethod: "paypal",
    deviceType: "mobile",
    priorityBucket: "high",
    priorityScore: 82,
    shippingState: "CO",
    billingZip: "28289",
    shippingZip: "28289",
    predictionReason: "Mobile checkout with delayed shipment history.",
    subtotal: 166.57,
    shippingFee: 5,
    taxAmount: 15.33,
    lines: [
      {
        productId: 6,
        productName: "Compact Coffee Grinder",
        sku: "SKU-0006",
        category: "Home",
        quantity: 1,
        unitPrice: 78.4,
        lineTotal: 78.4
      },
      {
        productId: 5,
        productName: "Premium Vitamins",
        sku: "SKU-0005",
        category: "Sports",
        quantity: 2,
        unitPrice: 57.22,
        lineTotal: 114.44
      }
    ]
  },
  {
    orderId: 4998,
    customerId: 2,
    customerName: "Juan Flores",
    orderDateTime: "2025-10-03 09:12:18",
    total: 68.68,
    paymentMethod: "card",
    deviceType: "desktop",
    priorityBucket: "normal",
    priorityScore: 35,
    shippingState: "CO",
    billingZip: "88907",
    shippingZip: "88907",
    predictionReason: "Low-value order with short distance band.",
    subtotal: 52.48,
    shippingFee: 12,
    taxAmount: 4.2,
    lines: [
      {
        productId: 1,
        productName: "Portable Tool Kit",
        sku: "SKU-0001",
        category: "Garden",
        quantity: 1,
        unitPrice: 49.01,
        lineTotal: 49.01
      }
    ]
  },
  {
    orderId: 4997,
    customerId: 3,
    customerName: "Mary Gonzalez",
    orderDateTime: "2025-12-02 19:44:55",
    total: 230.31,
    paymentMethod: "bank",
    deviceType: "tablet",
    priorityBucket: "expedite",
    priorityScore: 91,
    shippingState: "OH",
    billingZip: "46421",
    shippingZip: "46421",
    predictionReason: "High predicted delay and premium loyalty tier.",
    subtotal: 208.62,
    shippingFee: 5,
    taxAmount: 16.69,
    lines: [
      {
        productId: 2,
        productName: "Premium Monitor",
        sku: "SKU-0002",
        category: "Automotive",
        quantity: 1,
        unitPrice: 286.27,
        lineTotal: 286.27
      }
    ]
  }
];

export const warehouseQueue: WarehousePriorityItem[] = [
  {
    orderId: 4997,
    customerName: "Mary Gonzalez",
    customerState: "OH",
    orderDateTime: "2025-12-02 19:44:55",
    orderTotal: 230.31,
    priorityBucket: "expedite",
    priorityScore: 91,
    estimatedShipHours: 6,
    delayDays: 4,
    carrier: "FedEx",
    predictionReason: "Gold-tier customer with 4-day delay."
  },
  {
    orderId: 4999,
    customerName: "Patricia Diallo",
    customerState: "CO",
    orderDateTime: "2025-10-28 08:15:00",
    orderTotal: 186.9,
    priorityBucket: "high",
    priorityScore: 82,
    estimatedShipHours: 9,
    delayDays: 3,
    carrier: "UPS",
    predictionReason: "High predicted delay and multi-item basket."
  },
  {
    orderId: 5000,
    customerName: "Patricia Diallo",
    customerState: "CO",
    orderDateTime: "2025-11-18 14:20:07",
    orderTotal: 629.28,
    priorityBucket: "normal",
    priorityScore: 59,
    estimatedShipHours: 18,
    delayDays: 2,
    carrier: "USPS",
    predictionReason: "Large order with moderate backlog risk."
  }
];

export function getCustomer(customerId: number | undefined) {
  if (!customerId) {
    return undefined;
  }

  return customers.find((customer) => customer.customerId === customerId);
}

export function getOrdersForCustomer(customerId: number | undefined) {
  if (!customerId) {
    return [];
  }

  return orders.filter((order) => order.customerId === customerId);
}

export function getOrder(orderId: number) {
  return orders.find((order) => order.orderId === orderId);
}
