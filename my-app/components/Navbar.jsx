'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Không thể tải danh mục');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  const menuItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Danh mục', href: '/categories', Dropdown: true },
    { name: 'Liên hệ', href: '/contact' },
  ];

  return (
    <div className="bg-gray-100 border-t border-gray-200 top-[64px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-start gap-8 relative">
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
    </div>
  );
}
