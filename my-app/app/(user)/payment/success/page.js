'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white">
        {' '}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>{' '}
        <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>{' '}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      {' '}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
        {' '}
        <CheckCircle className="text-green-500 w-20 h-20 mx-auto mb-4" />{' '}
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Thanh toán thành công!{' '}
        </h1>{' '}
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã mua hàng. Đơn hàng #{orderId || '...'} của bạn đã được
          xác nhận.{' '}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/orders"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Xem đơn hàng
          </Link>
          <button
            onClick={() => router.push('/')}
            className="border border-green-600 text-green-600 px-5 py-2 rounded-lg hover:bg-green-50 transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
