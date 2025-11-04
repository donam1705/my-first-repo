import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);
        if (existing) {
          existing.qty += 1;
        } else {
          items.push({ ...product, qty: 1 });
        }
        set({ items: [...items] });
      },
      increase: (id) => {
        const items = get().items.map((i) =>
          i.id === id ? { ...i, qty: i.qty + 1 } : i
        );
        set({ items });
      },
      decrease: (id) => {
        const items = get()
          .items.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0);
        set({ items });
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
);
