'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchCategories = async () => {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Không thể tải danh mục');
  return res.json();
};

const fetchCurrentUser = async () => {
  const res = await fetch('/api/auth/me', { cache: 'no-store' });
  const data = await res.json();
  return data.user;
};

const logoutUser = async () => {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error('Đăng xuất thất bại');
  return true;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      router.refresh();
    },
  });

  const menuItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Danh mục', href: '/categories', Dropdown: true },
    { name: 'Liên hệ', href: '/contact' },
  ];

  return (
    <div className="bg-gray-100 border-t border-gray-200 top-[64px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center relative">
        <div className="flex gap-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => item.Dropdown && setOpen(true)}
                onMouseLeave={() => item.Dropdown && setOpen(false)}
              >
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  {item.name}
                </Link>

                {item.Dropdown && open && categories.length > 0 && (
                  <div
                    className={`absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56 z-50 transition-all duration-200 ${
                      open
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        onClick={() => setOpen(false)}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {loadingUser ? (
            <span className="text-gray-500 text-sm">Đang tải...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                Xin chào, <b>{user.name || user.email}</b>
              </span>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-sm text-red-600 hover:underline"
              >
                {logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="text-sm text-gray-600 hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
