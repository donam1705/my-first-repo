'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (!res.ok) {
          console.error(data.error);
          setOrder(null);
        } else {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetryLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/payment/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();

      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setMessage(data.error || 'Không thể tạo lại thanh toán.');
      }
    } catch (error) {
      console.error('Retry payment error:', error);
      setMessage('Có lỗi xảy ra khi tạo lại thanh toán.');
    } finally {
      setRetryLoading(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Đang tải...</p>;
  if (!order)
    return <p className="p-6 text-center">Không tìm thấy đơn hàng.</p>;

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{order.id}</h1>

      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Thông tin người nhận</h2>
        <p>
          <strong>Tên:</strong> {order.receiverName}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {order.phone}
        </p>
        <p>
          <strong>Địa chỉ:</strong> {order.address}
        </p>
        {order.note && (
          <p>
            <strong>Ghi chú:</strong> {order.note}
          </p>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Sản phẩm trong đơn</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Sản phẩm</th>
              <th className="border p-2 text-center">Số lượng</th>
              <th className="border p-2 text-right">Giá</th>
              <th className="border p-2 text-right">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border">
                <td className="p-2 flex items-center gap-2">
                  <img
                    src={item.product.imageUrl || '/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span>{item.product.name}</span>
                </td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">
                  {item.price.toLocaleString()}₫
                </td>
                <td className="p-2 text-right">
                  {(item.quantity * item.price).toLocaleString()}₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="text-right font-bold text-lg">
        Tổng thanh toán:{' '}
        <span className="text-blue-600">
          {order.totalAmount.toLocaleString()}₫
        </span>
      </div>

      <div className="mt-4 text-right">
        <span
          className={`inline-block px-3 py-1 rounded text-sm font-medium ${
            order.status === 'PAID'
              ? 'bg-green-100 text-green-700'
              : order.status === 'FAILED'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Trạng thái: {order.status}
        </span>
      </div>

      {order.status === 'FAILED' && (
        <div className="mt-6 text-center">
          <button
            onClick={handleRetryPayment}
            disabled={retryLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition"
          >
            {retryLoading ? 'Đang xử lý...' : 'Thanh toán lại qua VNPay'}
          </button>
          {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/orders" className="text-blue-600 hover:underline">
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>
    </main>
  );
}
