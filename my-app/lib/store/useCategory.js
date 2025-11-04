import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCategoryStore = create(
  persist((set, get) => ({
    categories: [],

    fetchCategories: async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (Array.isArray(data)) set({ categories: data });
      } catch (err) {
        console.error('Lỗi khi fetch categories:', err);
      }
    },

    addCategory: (category) => {
      set((state) => ({
        categories: [...state.categories, category],
      }));
    },

    updateCategory: (id, updated) => {
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, ...updated } : c
        ),
      }));
    },

    deleteCategory: (id) => {
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    },
  }))
);
