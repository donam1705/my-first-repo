'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch('/api/orders');
      if (res.status === 401) return;
      const data = await res.json();
      setOrders(data);
    }
    fetchOrders();
  }, []);

  if (!orders || orders.length === 0)
    return <p className="p-6 text-center">Bạn chưa có đơn hàng nào.</p>;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của bạn</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-bold">Mã đơn: #{order.id}</p>
              <p>Trạng thái: {order.status}</p>
              <p>
                Tổng tiền:{' '}
                <span className="font-bold">
                  {order.total.toLocaleString()}₫
                </span>
              </p>
            </div>
            <Link
              href={`/orders/${order.id}`}
              className="text-blue-600 hover:underline"
            >
              Xem chi tiết →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
