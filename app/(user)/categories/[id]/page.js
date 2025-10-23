'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryDetailPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`/api/categories/${id}`),
          fetch(`/api/products?categoryId=${id}`),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (!catData.error) setCategory(catData);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu danh mục:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );

  if (!category)
    return (
      <div className="text-center text-red-500 py-10">
        <p>Không tìm thấy danh mục này.</p>
        <Link
          href="/categories"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Quay lại danh sách danh mục
        </Link>
      </div>
    );

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600 text-lg">{category.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          Chưa có sản phẩm nào trong danh mục này.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-100"
            >
              <div className="relative">
                <Image
                  src={p.imageUrl || '/no-image.png'}
                  alt={p.name}
                  width={400}
                  height={300}
                  className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {p.category?.name}
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-800 mb-1 truncate">
                  {p.name}
                </h2>
                <p className="text-red-600 font-bold">
                  {p.price.toLocaleString()}₫
                </p>
                <button
                  href={`/products/${p.id}`}
                  className="block mt-2 text-sm text-blue-600 hover:underline"
                >
                  Xem chi tiết →
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/categories"
          className="inline-block bg-gray-200 text-gray-700 px-5 py-2 rounded hover:bg-gray-300 transition"
        >
          ← Quay lại danh mục
        </Link>
      </div>
    </main>
  );
}
