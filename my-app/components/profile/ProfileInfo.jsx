'use client';
import { useEffect, useState } from 'react';

export default function ProfileInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const formatDate = (d) => {
    if (!d) return 'Chưa có';
    try {
      return new Date(d).toLocaleDateString('vi-VN');
    } catch {
      return 'Chưa có';
    }
  };

  if (!user) return <p>Không thể tải thông tin.</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Thông tin cá nhân
      </h2>

      <div className="space-y-4 text-gray-700 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Họ tên:</span>
          <span>{user.name}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Email:</span>
          <span>{user.email}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Số điện thoại:</span>
          <span>{user.phone || 'Chưa có'}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Ngày sinh:</span>
          <span>{formatDate(user.birthDate)}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Địa chỉ:</span>
          <span className="text-right">{user.address || 'Chưa có'}</span>
        </div>
      </div>
    </div>
  );
}
