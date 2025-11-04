'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PaymentPendingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/orders');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center bg-blue-50 p-6 text-center">
      <div className="animate-spin text-blue-600 mb-4">
        <Loader2 size={64} strokeWidth={2.5} />
      </div>

      <h1 className="text-2xl font-bold text-blue-700 mb-2">
        Đang xử lý thanh toán...
      </h1>
      <p className="text-gray-700 max-w-md mb-4">
        Vui lòng không đóng hoặc tải lại trang trong khi hệ thống đang xác nhận
        giao dịch với VNPay.
      </p>

      <p className="text-sm text-gray-500 italic">
        (Nếu bạn đã thanh toán thành công, bạn sẽ được chuyển hướng tự động.)
      </p>

      <div className="mt-8">
        <div className="w-64 h-2 bg-blue-200 rounded-full overflow-hidden">
          <div className="w-full h-full bg-blue-600 animate-[progress_5s_linear_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </main>
  );
}
