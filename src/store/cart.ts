import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, stock: item.stock, quantity: Math.min(i.quantity + qty, item.stock) }
                  : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: Math.min(qty, item.stock) }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
              : i
          ),
        })),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "carrinho" }
  )
);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
