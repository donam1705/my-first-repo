'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/useCart';
import { ShoppingCart } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500">Đang tải sản phẩm...</p>
    );

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Tất cả sản phẩm
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              <Link href={`/products/${p.id}`} className="relative w-full h-56">
                <Image
                  src={p.imageUrl || '/no-image.png'}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <div className="flex flex-col flex-1 p-4">
                <h2 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition">
                  {p.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1 mb-2">
                  {p.category?.name ? (
                    <Link
                      href={`/categories/${p.category.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {p.category.name}
                    </Link>
                  ) : (
                    'Chưa có danh mục'
                  )}
                </p>

                <p className="text-xl font-bold text-blue-600 mb-4">
                  {p.price.toLocaleString()} ₫
                </p>

                <button
                  onClick={() => addToCart(p)}
                  className="mt-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
                >
                  <ShoppingCart size={18} />
                  <span>Thêm vào giỏ hàng</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
