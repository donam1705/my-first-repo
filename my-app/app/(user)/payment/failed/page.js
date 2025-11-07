'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const params = useSearchParams();
  const router = useRouter();
  const reason = params.get('reason') || 'Không xác định';
  const orderId = params.get('orderId');

  const messages = {
    checksum: 'Dữ liệu không hợp lệ (Checksum sai)',
    notfound: 'Không tìm thấy đơn hàng',
    vnp_error: 'VNPay từ chối giao dịch',
    server: 'Lỗi máy chủ trong quá trình xử lý',
    default: 'Giao dịch không thành công',
  };

  const errorMessage = messages[reason] || messages.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] bg-gradient-to-br from-red-50 to-rose-100 px-4">
      {' '}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
        {' '}
        <XCircle className="text-red-500 w-20 h-20 mx-auto mb-4" />{' '}
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Thanh toán thất bại!{' '}
        </h1>{' '}
        <p className="text-gray-600 mb-6">
          Nguyên nhân: {errorMessage}
          {orderId && (
            <span className="block text-sm text-gray-400 mt-1">
              Mã đơn hàng: #{orderId}{' '}
            </span>
          )}{' '}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="border border-red-600 text-red-600 px-5 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
