'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Folder, Package, Settings, Users } from 'lucide-react';

export default function SidebarAdmin() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: <Home size={18} /> },
    { name: 'Products', href: '/admin/products', icon: <Package size={18} /> },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: <Folder size={18} />,
    },
    { name: 'Users', href: '/admin/users', icon: <Users size={18} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 h-screen shadow-lg">
      <div className="px-6 py-4 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 text-sm text-gray-400 border-t border-gray-700">
        © 2025 MyShop Admin
      </div>
    </aside>
  );
}
