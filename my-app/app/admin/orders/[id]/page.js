'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PackageCheck } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-order', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/admin/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tải được đơn hàng');
      return {
        ...data,
        items: Array.isArray(data.items) ? data.items : [],
      };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await fetch(`/api/orders/admin/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Không thể cập nhật trạng thái');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-order', params.id]);
      alert('Cập nhật trạng thái thành công!');
      setSelectedStatus('');
    },
    onError: (err) => {
      alert('Lỗi: ' + err.message);
    },
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
        <Loader2 className="animate-spin text-blue-500 mb-3" size={40} />
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <p className="text-lg font-semibold">Lỗi: {error.message}</p>
        <button
          onClick={() => router.back()}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Quay lại
        </button>
      </div>
    );

  if (!order)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-600">
        Không tìm thấy đơn hàng.
      </div>
    );

  const statuses = [
    { value: 'PENDING', label: 'Đang chờ' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'SHIPPED', label: 'Đang giao' },
    { value: 'COMPLETED', label: 'Hoàn tất' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Đơn hàng #{order.id}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            order.status === 'PAID'
              ? 'bg-green-100 text-green-700'
              : order.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-700'
              : order.status === 'SHIPPED'
              ? 'bg-blue-100 text-blue-700'
              : order.status === 'COMPLETED'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {statuses.find((s) => s.value === order.status)?.label ||
            order.status}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 border-b pb-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Thông tin khách hàng
          </h2>
          <p>
            <span className="font-medium">Tên:</span> {order.receiverName}
          </p>
          <p>
            <span className="font-medium">Số điện thoại:</span> {order.phone}
          </p>
          <p>
            <span className="font-medium">Địa chỉ:</span> {order.address}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Thông tin thanh toán
          </h2>
          <p>
            <span className="font-medium">Tổng tiền:</span>{' '}
            {order.totalAmount.toLocaleString()} ₫
          </p>
          <p>
            <span className="font-medium">Phương thức:</span> VNPay
          </p>
          <p>
            <span className="font-medium">Mã giao dịch:</span>{' '}
            {order.txnRef || '—'}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Sản phẩm trong đơn hàng
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-center">Số lượng</th>
                <th className="px-4 py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.length > 0 ? (
                order.items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={item.product?.imageUrl || '/no-image.jpg'}
                        alt={item.product?.name || 'Sản phẩm'}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <span>{item.product?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {(item.price * item.quantity).toLocaleString()} ₫
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Không có sản phẩm trong đơn hàng này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end md:items-center gap-3 pt-4 border-t">
        <button
          onClick={() => router.push('/admin/orders')}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Quay lại danh sách
        </button>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn trạng thái --</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => updateStatusMutation.mutate(selectedStatus)}
            disabled={
              !selectedStatus ||
              updateStatusMutation.isPending ||
              selectedStatus === order.status
            }
            className={`px-5 py-2.5 rounded-lg transition flex items-center gap-2 ${
              updateStatusMutation.isPending
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {updateStatusMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Đang cập nhật...
              </>
            ) : (
              <>
                <PackageCheck size={18} /> Cập nhật trạng thái
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
