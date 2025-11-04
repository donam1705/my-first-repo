'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const triggerToast = (message, type = 'default') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleActionClick = (orderId, type) => {
    setSelectedOrder(orderId);
    setModalType(type);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedOrder) return;
    try {
      const url =
        modalType === 'cancel'
          ? `/api/orders/${selectedOrder}/cancel`
          : `/api/orders/${selectedOrder}/delete`;
      const method = modalType === 'cancel' ? 'PUT' : 'DELETE';

      const res = await fetch(url, {
        method,
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        triggerToast(data.error || 'Thao tác thất bại!', 'error');
        return;
      }

      if (modalType === 'cancel') {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder ? { ...o, status: 'CANCELLED' } : o
          )
        );
        triggerToast('Hủy đơn hàng thành công!', 'success');
      }

      if (modalType === 'delete') {
        setOrders((prev) => prev.filter((o) => o.id !== selectedOrder));
        triggerToast('Xóa đơn hàng thành công!', 'success');
      }
    } catch {
      triggerToast('Có lỗi xảy ra!', 'error');
    } finally {
      setShowModal(false);
      setSelectedOrder(null);
      setModalType('');
    }
  };

  if (loading) return <p className="p-6 text-center">Đang tải đơn hàng...</p>;
  if (!orders || orders.length === 0)
    return <p className="p-6 text-center">Bạn chưa có đơn hàng nào.</p>;

  return (
    <main className="max-w-6xl mx-auto p-6 relative">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của bạn</h1>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-bold">Mã đơn: #{order.id}</p>
              <p>
                Trạng thái:{' '}
                <span
                  className={`font-semibold ${
                    order.status === 'CANCELLED' ? 'text-red-500' : ''
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p className="text-gray-600">
                Tổng tiền:
                <span className="font-bold text-blue-600">
                  {' '}
                  {order.totalAmount.toLocaleString()}₫
                </span>
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/orders/${order.id}`}
                className="text-blue-600 hover:underline"
              >
                Xem chi tiết →
              </Link>

              {order.status === 'PENDING' && (
                <button
                  onClick={() => handleActionClick(order.id, 'cancel')}
                  className="text-red-600 hover:underline"
                >
                  Hủy đơn
                </button>
              )}

              {order.status === 'CANCELLED' && (
                <button
                  onClick={() => handleActionClick(order.id, 'delete')}
                  className="text-gray-600 hover:text-red-600"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ConfirmModal
          message={
            modalType === 'cancel'
              ? 'Bạn có chắc muốn hủy đơn hàng này không?'
              : 'Bạn có chắc muốn xóa vĩnh viễn đơn hàng này không?'
          }
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
