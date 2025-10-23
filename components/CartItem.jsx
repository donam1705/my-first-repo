'use client';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';

export default function CartItem({ item }) {
  const { increase, decrease } = useCartStore();
  const [confirm, setConfirm] = useState(false);

  const handleDecrease = () => {
    if (item.qty === 1) {
      setConfirm(true);
    } else {
      decrease(item.id);
    }
  };

  return (
    <div className="flex items-center justify-between border-b py-3">
      <div className="flex items-center gap-3">
        <img
          src={item.imageUrl || '/no-image.png'}
          alt={item.name}
          className="w-16 h-16 rounded object-cover"
        />
        <div>
          <h4 className="font-semibold">{item.name}</h4>
          <p className="text-sm text-gray-500">${item.price}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrease}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          -
        </button>
        <span>{item.qty}</span>
        <button
          onClick={() => increase(item.id)}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          +
        </button>
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow">
            <p>Bạn muốn xóa sản phẩm khỏi giỏ hàng?</p>
            <div className="flex gap-2 mt-3 justify-end">
              <button
                onClick={() => {
                  decrease(item.id);
                  setConfirm(false);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
