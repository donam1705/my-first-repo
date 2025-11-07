'use client';
import { useState } from 'react';
import {
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  Eye,
  Banknote,
  Wallet,
  Package,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) throw new Error('Không thể tải danh sách đơn hàng');
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      alert('Cập nhật trạng thái thành công!');
    },
    onError: () => {
      alert('Lỗi khi cập nhật đơn hàng.');
    },
  });

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search.trim() !== '') {
      const s = search.toLowerCase();
      return (
        o.receiverName?.toLowerCase().includes(s) ||
        o.phone?.includes(s) ||
        String(o.id).includes(s)
      );
    }
    return true;
  });

  const formatCurrency = (num) =>
    num?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const handleUpdateStatus = (orderId, newStatus) => {
    if (confirm(`Bạn có chắc muốn cập nhật trạng thái đơn #${orderId}?`)) {
      updateStatusMutation.mutate({ orderId, newStatus });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-600">
        <Loader2 className="animate-spin mr-2 text-blue-500" />
        Đang tải danh sách đơn hàng...
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 mt-10">
        Lỗi khi tải danh sách đơn hàng.
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>

      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <span className="font-medium text-gray-700">Trạng thái:</span>
        {['ALL', 'PENDING', 'PAID', 'FAILED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'ALL'
              ? 'Tất cả'
              : status === 'PENDING'
              ? 'Đang chờ'
              : status === 'PAID'
              ? 'Đã thanh toán'
              : status === 'FAILED'
              ? 'Thất bại'
              : 'Đã hủy'}
          </button>
        ))}
        <div className="flex-grow"></div>
        <input
          type="text"
          placeholder="Tìm theo mã đơn, tên, số điện thoại..."
          className="border rounded-lg px-3 py-2 text-sm w-72 focus:ring-2 focus:ring-blue-400 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-5 py-3">Mã đơn</th>
              <th className="px-5 py-3">Khách hàng</th>
              <th className="px-5 py-3">SĐT</th>
              <th className="px-5 py-3">Tổng tiền</th>
              <th className="px-5 py-3">Phương thức</th>
              <th className="px-5 py-3 text-center">Thanh toán</th>
              <th className="px-5 py-3 text-center">Trạng thái</th>
              <th className="px-5 py-3">Ngày tạo</th>
              <th className="px-5 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  Không có đơn hàng nào.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50 transition-colors duration-100"
                >
                  <td className="px-5 py-2 font-medium text-gray-800">
                    #{order.id}
                  </td>
                  <td className="px-5 py-2">{order.receiverName || '—'}</td>
                  <td className="px-5 py-2">{order.phone}</td>
                  <td className="px-5 py-2 font-semibold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-5 py-2">
                    <PaymentMethodBadge method={order.paymentMethod} />
                  </td>
                  <td className="px-5 py-2 text-center">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-2 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-2 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-2 text-center space-x-2">
                    <button
                      onClick={() =>
                        window.open(`/admin/orders/${order.id}`, '_blank')
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={18} />
                    </button>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PAID')}
                        disabled={updateStatusMutation.isPending}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {order.status !== 'CANCELLED' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(order.id, 'CANCELLED')
                        }
                        disabled={updateStatusMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Ban size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING: {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-300',
      text: 'Đang chờ',
      icon: <Clock size={14} />,
    },
    PAID: {
      color: 'bg-green-50 text-green-700 border-green-300',
      text: 'Đã thanh toán',
      icon: <CheckCircle size={14} />,
    },
    FAILED: {
      color: 'bg-red-50 text-red-700 border-red-300',
      text: 'Thất bại',
      icon: <XCircle size={14} />,
    },
    CANCELLED: {
      color: 'bg-gray-50 text-gray-600 border-gray-300',
      text: 'Đã hủy',
      icon: <Ban size={14} />,
    },
  };
  const { color, text, icon } = map[status] || map.PENDING;
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      {icon}
      {text}
    </span>
  );
}

function PaymentMethodBadge({ method }) {
  const normalized = method?.toUpperCase?.() || 'OTHER';

  let key = 'OTHER';
  if (normalized.includes('VNPAY')) key = 'VNPAY';
  else if (normalized.includes('COD')) key = 'COD';
  else if (normalized.includes('BANK')) key = 'BANK_TRANSFER';

  const map = {
    VNPAY: {
      color: 'text-blue-700 bg-blue-50 border-blue-300',
      label: 'VNPay',
      icon: <Wallet size={14} />,
    },
    COD: {
      color: 'text-orange-700 bg-orange-50 border-orange-300',
      label: 'COD',
      icon: <Package size={14} />,
    },
    BANK_TRANSFER: {
      color: 'text-green-700 bg-green-50 border-green-300',
      label: 'Chuyển khoản',
      icon: <Banknote size={14} />,
    },
    OTHER: {
      color: 'text-gray-600 bg-gray-50 border-gray-300',
      label: 'Khác',
      icon: <Wallet size={14} />,
    },
  };

  const { color, label, icon } = map[key];
  return (
    <span
      className={`inline-flex items-center gap-1 border px-3 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {icon} {label}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  const map = {
    unpaid: {
      color: 'text-red-600 bg-red-50 border-red-200',
      label: 'Chưa thanh toán',
    },
    paid: {
      color: 'text-green-700 bg-green-50 border-green-200',
      label: 'Đã thanh toán',
    },
    pending: {
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      label: 'Đang xử lý',
    },
  };
  const { color, label } = map[status] || map.unpaid;
  return (
    <span
      className={`inline-block border px-3 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
