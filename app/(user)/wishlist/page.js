'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const res = await fetch('/api/wishlist');
      if (res.status === 401) return;
      const data = await res.json();
      setWishlist(data);
    };
    fetchWishlist();
  }, []);

  if (!wishlist || wishlist.length === 0) {
    return (
      <p className="p-6 text-center">Bạn chưa có sản phẩm yêu thích nào.</p>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sản phẩm yêu thích</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col"
          >
            <Link href={`/products/${item.product.id}`}>
              <Image
                src={item.product.imageUrl || '/no-image.png'}
                alt={item.product.name}
                width={300}
                height={200}
                className="rounded mb-4 object-cover h-40 w-full"
              />
            </Link>
            <h3 className="font-semibold text-lg">
              <Link href={`/products/${item.product.id}`}>
                {item.product.name}
              </Link>
            </h3>
            <p className="text-blue-600 font-bold">
              {item.product.price.toLocaleString()}₫
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
