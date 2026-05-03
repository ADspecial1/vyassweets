export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string | { _id: string; name: string; slug: string } | null;
  displayOrder: number;
  active: boolean;
}

export interface Discount {
  type: 'flat' | 'percent';
  value: number;
  active: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryId: Category | string;
  description: string;
  shortDescription?: string;
  images: string[];
  price: number;
  mrp: number;
  weight: number;
  unit: 'g' | 'kg' | 'pcs';
  stock: number;
  sku: string;
  discount?: Discount;
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface Banner {
  _id: string;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  displayOrder: number;
  active: boolean;
}

export interface Address {
  _id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  addresses: Address[];
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingFee: number;
  gst: number;
  total: number;
  address: Address;
  status: 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment: {
    provider: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    status: 'created' | 'paid' | 'failed';
    paidAt?: string;
  };
  createdAt: string;
}

export interface CartItem {
  productId: string;
  qty: number;
  product?: Product;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}
