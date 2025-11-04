'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="max-w-lg mx-auto mt-20 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Thanh toán thành công!
      </h1>
      {orderId && <p className="text-gray-700 mb-2">Mã đơn hàng: #{orderId}</p>}
      <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua hàng tại MyShop 🎉</p>
      <Link
        href="/orders"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Xem đơn hàng của tôi
      </Link>
    </div>
  );
}
