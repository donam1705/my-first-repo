import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        const existing = get().items.find((item) => item.id === product.id);

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ),
          });
        } else {
          set({
            items: [...get().items, { ...product, qty: 1 }],
          });
        }
      },

      removeFromCart: (id) =>
        set({
          items: get().items.filter((item) => item.id !== id),
        }),

      updateQty: (id, qty) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, qty } : item
          ),
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage,
    }
  )
);
