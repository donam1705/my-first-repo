'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const params = useSearchParams();
  const reason = params.get('reason');

  return (
    <div className="max-w-lg mx-auto mt-20 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Thanh toán thất bại!
      </h1>
      <p className="text-gray-700 mb-2">
        Nguyên nhân:{' '}
        {reason === 'checksum'
          ? 'Sai chữ ký bảo mật'
          : reason === 'notfound'
          ? 'Không tìm thấy đơn hàng'
          : reason === 'vnp_error'
          ? 'VNPay từ chối giao dịch'
          : 'Lỗi máy chủ'}
      </p>
      <p className="text-gray-600 mb-6">
        Vui lòng thử lại hoặc chọn phương thức khác.
      </p>
      <Link
        href="/checkout"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Quay lại thanh toán
      </Link>
    </div>
  );
}
