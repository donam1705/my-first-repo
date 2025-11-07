'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, Banknote, Copy, Loader2 } from 'lucide-react';

export default function BankTransferPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const amount = params.get('amount');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/bank/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật thanh toán');
      setMessage(
        'Đơn hàng của bạn đã được ghi nhận và đang chờ xác nhận thanh toán.'
      );
      setTimeout(() => router.push('/orders'), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
      {' '}
      <h1 className="text-3xl font-extrabold mb-2 text-blue-700">
        Chuyển khoản ngân hàng
      </h1>{' '}
      <p className="text-gray-600 mb-6">
        Vui lòng kiểm tra kỹ thông tin và thực hiện chuyển khoản theo hướng dẫn
        bên dưới.{' '}
      </p>
      <div className="bg-blue-50 rounded-xl p-5 text-left mb-6 border border-blue-200">
        <h2 className="font-semibold text-lg mb-3 text-blue-800 flex items-center gap-2">
          <Banknote size={20} /> Thông tin thanh toán
        </h2>
        <div className="space-y-2 text-gray-800">
          <p>
            <strong>Ngân hàng:</strong> Vietcombank (VCB)
          </p>
          <p className="flex items-center gap-2">
            <strong>Số tài khoản:</strong> 0123456789{' '}
            <button
              onClick={() => handleCopy('0123456789')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <Copy size={14} /> {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </p>
          <p>
            <strong>Chủ tài khoản:</strong> NGUYEN VAN A
          </p>
          <p>
            <strong>Số tiền:</strong>{' '}
            <span className="text-green-700 font-semibold">
              {Number(amount).toLocaleString()} đ
            </span>
          </p>
          <p>
            <strong>Nội dung chuyển khoản:</strong>{' '}
            <span className="font-medium text-gray-700">
              Thanh toan don hang #{orderId}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center mb-5">
        <img
          src="/bank_qr.png"
          alt="QR chuyển khoản"
          className="w-56 h-56 object-contain mb-3 border rounded-xl shadow-md"
        />
        <p className="text-sm text-gray-500">
          Quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán nhanh hơn.
        </p>
      </div>
      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.includes('✅')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className={`${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        } text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 w-full transition`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle size={20} /> Tôi đã chuyển khoản
          </>
        )}
      </button>
      <p className="text-sm text-gray-400 mt-5">
        Sau khi xác nhận, hệ thống sẽ cập nhật trạng thái đơn hàng của bạn trong
        vài phút.
      </p>
    </div>
  );
}
