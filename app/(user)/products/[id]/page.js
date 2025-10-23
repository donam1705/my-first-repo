'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCart';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Không thể tải sản phẩm');
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">Đang tải sản phẩm...</p>
    );

  if (!product)
    return (
      <p className="text-center text-red-500 mt-10">Không tìm thấy sản phẩm.</p>
    );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-md rounded-xl p-6">
        <div className="relative w-full h-96">
          <Image
            src={product.imageUrl || '/no-image.png'}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>
            {product.category && (
              <Link
                href={`/categories/${product.category.id}`}
                className="text-blue-600 text-sm hover:underline mb-4 inline-block"
              >
                {product.category.name}
              </Link>
            )}

            <p className="text-2xl font-semibold text-blue-600 mb-4">
              {product.price.toLocaleString()}₫
            </p>

            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Mô tả sản phẩm
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description
                  ? product.description
                  : 'Sản phẩm này chưa có mô tả chi tiết.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md py-3 font-medium text-lg transition"
          >
            <ShoppingCart size={20} />
            <span>Thêm vào giỏ hàng</span>
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </main>
  );
}
