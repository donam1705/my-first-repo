'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/useCart';

export default function ProductItem({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isFav, setIsFav] = useState(false);

  const toggleWishlist = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    try {
      if (isFav) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
      }
      setIsFav(!isFav);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative w-full h-56 overflow-hidden">
          <Image
            src={product.imageUrl || '/uploads/placeholder.svg'}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600">
            {product.name}
          </h3>

          {/* {product.category && (
            <p className="text-sm text-gray-500 mb-3">
              {product.category.name}
            </p>
          )} */}

          <p className="text-blue-600 font-bold text-lg mt-auto">
            {product.price.toLocaleString()} ₫
          </p>
        </div>
      </Link>

      <button
        onClick={toggleWishlist}
        aria-pressed={isFav}
        className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur rounded-full p-2 hover:scale-105 transition"
        title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={isFav ? 'text-red-500' : 'text-gray-500'} size={18} />
      </button>

      <div className="p-4 pt-0">
        <button
          onClick={() => addToCart(product)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md py-2.5 transition"
        >
          <ShoppingCart size={18} />
          <span>Thêm vào giỏ hàng</span>
        </button>
      </div>
    </div>
  );
}
