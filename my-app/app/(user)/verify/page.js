'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Đang xác minh...');

  useEffect(() => {
    if (!token) {
      setMessage('Token không hợp lệ!');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage(
            'Xác minh thành công! Đang chuyển sang trang đăng nhập...'
          );
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          setMessage(data.error || 'Xác minh thất bại!');
        }
      } catch (err) {
        setMessage('Lỗi server, vui lòng thử lại!');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{message}</p>
    </div>
  );
}
