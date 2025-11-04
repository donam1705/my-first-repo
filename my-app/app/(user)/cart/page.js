'use client';
import { useCartStore } from '@/lib/store/useCart';
import ConfirmModal from '@/components/ConfirmModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

export default function CartPage() {
  const { items, updateQty, removeFromCart, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();

  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleDecrease = (item) => {
    if (item.qty === 1) {
      setConfirmMessage(`Bạn muốn xóa "${item.name}" khỏi giỏ hàng?`);
      setConfirmAction(() => () => removeFromCart(item.id));
    } else {
      updateQty(item.id, item.qty - 1);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (items.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }
    router.push('/checkout');
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛒 Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border text-left">Sản phẩm</th>
                  <th className="p-3 border text-center">Số lượng</th>
                  <th className="p-3 border text-right">Giá</th>
                  <th className="p-3 border text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="min-w-[20px]">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {item.price.toLocaleString()} ₫
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {(item.price * item.qty).toLocaleString()} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              onClick={() => {
                setConfirmMessage('Xóa toàn bộ sản phẩm trong giỏ hàng?');
                setConfirmAction(() => clearCart);
              }}
              className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
            >
              Xóa giỏ hàng
            </button>

            <p className="text-2xl font-bold">
              Tổng tiền:{' '}
              <span className="text-blue-600">{total.toLocaleString()} ₫</span>
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Thanh toán
            </button>
          </div>
        </>
      )}

      {confirmAction && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={() => {
            confirmAction();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </main>
  );
}
