'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  if (loading) return <p className="text-center mt-10">Đang tải kết quả...</p>;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Kết quả tìm kiếm cho: <span className="text-blue-600">{query}</span>
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-4 bg-white hover:shadow-lg transition"
            >
              <img
                src={p.imageUrl || '/no-image.png'}
                alt={p.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-gray-600 text-sm">
                {p.category?.name || 'Không có danh mục'}
              </p>
              <p className="text-blue-600 font-bold mt-2">
                {p.price.toLocaleString()}₫
              </p>
              <Link
                href={`/products/${p.id}`}
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
