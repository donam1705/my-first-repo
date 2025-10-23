'use client';
import { useCartStore } from '@/lib/store/useCart';
import ConfirmModal from '@/components/ConfirmModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cookies } from 'next/headers';
import { useAuth } from '@/lib/auth';

export default function CartPage() {
  const { items, updateQty, removeFromCart, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();

  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleDecrease = (item) => {
    if (item.qty === 1) {
      setConfirmMessage(`Loại bỏ sản phẩm "${item.name}" khỏi giỏ hàng?`);
      setConfirmAction(() => () => removeFromCart(item.id));
    } else {
      updateQty(item.id, item.qty - 1);
    }
  };

  const handleClearCart = () => {
    setConfirmMessage('Bạn có chắc muốn xóa toàn bộ giỏ hàng?');
    setConfirmAction(() => clearCart);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      alert('Bạn phải đăng nhập để đặt hàng!');
      return router.push('/auth/login');
    }

    if (items.length === 0) {
      return alert('Giỏ hàng đang trống!');
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.qty,
            price: i.price,
          })),
          receiverName: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.error || 'Đặt hàng không thành công!');
      }

      alert('Đặt hàng thành công!');
      clearCart();
      router.push('/user/orders');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Giỏ hàng trống.</p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Sản phẩm</th>
                <th className="p-2 border text-center w-32">Số lượng</th>
                <th className="p-2 border text-right w-32">Giá</th>
                <th className="p-2 border text-right w-32">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    {item.price.toLocaleString()} ₫
                  </td>
                  <td className="p-2 text-right">
                    {(item.price * item.qty).toLocaleString()} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleClearCart}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Xóa tất cả
            </button>
            <p className="text-xl font-bold">
              Tổng cộng:{' '}
              <span className="text-blue-600">{total.toLocaleString()} ₫</span>
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleCreateOrder}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Đặt hàng
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
