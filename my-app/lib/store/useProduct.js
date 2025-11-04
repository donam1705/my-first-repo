import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProductStore = create(
  persist((set, get) => ({
    products: [],

    fetchProducts: async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) {
          set({ products: data });
        } else {
          console.warn('API trả về dữ liệu không hợp lệ:', data);
        }
      } catch (err) {
        console.error('Lỗi khi fetch products:', err);
      }
    },

    addProduct: (product) => {
      set((state) => ({
        products: [...state.products, product],
      }));
    },

    updateProduct: (id, updated) => {
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updated } : p
        ),
      }));
    },

    deleteProduct: (id) => {
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    },

    searchProducts: (keyword) => {
      const { products } = get();
      return products.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    },
  }))
);
