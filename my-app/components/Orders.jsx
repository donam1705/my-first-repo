'use client';
import { useState, useEffect } from 'react';

export default function Orders({ userId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Demo giả lập dữ liệu đơn hàng
    setOrders([
      { id: 'DH001', date: '2025-10-10', total: 1200000, status: 'Đang giao' },
      { id: 'DH002', date: '2025-09-28', total: 560000, status: 'Hoàn thành' },
    ]);
  }, []);

  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">📦 Đơn hàng của bạn</h2>
      {orders.map((order) => (
        <div key={order.id} className="border-b pb-2 mb-3">
          <p>
            <strong>Mã đơn:</strong> {order.id}
          </p>
          <p>
            <strong>Ngày mua:</strong> {order.date}
          </p>
          <p>
            <strong>Tổng tiền:</strong> {order.total.toLocaleString()}₫
          </p>
          <p>
            <strong>Trạng thái:</strong> {order.status}
          </p>
        </div>
      ))}
    </div>
  );
}
