'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentResultPage() {
  const params = useSearchParams();
  const responseCode = params.get('vnp_ResponseCode');

  const isSuccess = responseCode === '00';

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center">
      <div
        className={`p-8 rounded-xl shadow-lg ${
          isSuccess ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <h1
          className={`text-2xl font-bold mb-3 ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
        </h1>
        <p className="text-gray-700 mb-6">
          {isSuccess
            ? 'Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được ghi nhận.'
            : 'Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác.'}
        </p>
        <Link href="/orders" className="text-blue-600 hover:underline">
          Xem đơn hàng
        </Link>
      </div>
    </main>
  );
}
