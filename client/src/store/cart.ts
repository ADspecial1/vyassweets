import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: '',
      couponDiscount: 0,
      addItem: (productId) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return { items: state.items.map((i) => i.productId === productId ? { ...i, qty: i.qty + 1 } : i) };
          }
          return { items: [...state.items, { productId, qty: 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      updateQty: (productId, qty) =>
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((i) => i.productId !== productId) };
          return { items: state.items.map((i) => i.productId === productId ? { ...i, qty } : i) };
        }),
      clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),
      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: '', couponDiscount: 0 }),
    }),
    { name: 'vyas-cart' },
  ),
);
