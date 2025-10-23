'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCart';

export default function CategoryShow() {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const [catRes, prodRes] = await Promise.all([
          fetch(`${baseUrl}/api/categories`, { cache: 'no-store' }),
          fetch(`${baseUrl}/api/products`, { cache: 'no-store' }),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        const cats = Array.isArray(catData)
          ? catData
          : catData.categories || [];
        const prods = Array.isArray(prodData)
          ? prodData
          : prodData.products || [];

        setCategories(cats);
        setTrending(prods.slice(0, 4));
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setCategories([]);
        setTrending([]);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="max-w-7xl mx-auto py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
        {categories.slice(0, 5).map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.id}`}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
              <Image
                src={c.imageUrl || '/uploads/placeholder.svg'}
                alt={c.name}
                width={70}
                height={70}
                className="object-contain"
              />
            </div>
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
              {c.name}
            </h3>
            <p className="text-gray-500 text-sm">
              {c.products?.length || 0} sản phẩm
            </p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl overflow-hidden mb-12 p-4">
        {[
          {
            icon: '🚚',
            title: 'Free Delivery',
            desc: 'Orders from all items',
          },
          {
            icon: '💰',
            title: 'Return & Refund',
            desc: 'Money-back guarantee',
          },
          {
            icon: '🎁',
            title: 'Member Discount',
            desc: 'Every order over $140.00',
          },
          {
            icon: '🎧',
            title: 'Support 24/7',
            desc: 'Contact us 24 hours a day',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-6 hover:bg-blue-50 transition text-center bg-white rounded-xl shadow-sm"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h4 className="font-bold text-gray-800">{item.title}</h4>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Sản phẩm <span className="text-blue-600">Trending</span>
          </h2>
        </div>

        {trending.length === 0 ? (
          <p className="text-gray-500 text-center">
            Không có sản phẩm nổi bật.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                <Link
                  href={`/products/${p.id}`}
                  className="relative w-full h-48"
                >
                  <Image
                    src={p.imageUrl || '/uploads/placeholder.svg'}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-gray-800 font-semibold text-base line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-blue-600 font-bold mb-3">
                    {p.price.toLocaleString()} ₫
                  </p>

                  <button
                    onClick={() => addToCart(p)}
                    className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingCart size={16} />
                    <span>Thêm vào giỏ hàng</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
