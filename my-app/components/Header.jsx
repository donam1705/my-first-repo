'use client';
'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/useCart';
import { ChevronDown, Search, Menu, X, User } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function Header() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownUser, setDropdownUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownUser(false);
      }
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(data.slice(0, 5));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  const menuItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Danh mục', href: '/categories', dropdown: true },
    { name: 'Liên hệ', href: '/contact' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-blue-600 hover:text-blue-700 transition"
        >
          MyShop
        </Link>

        <div className="relative hidden md:flex flex-1 max-w-lg items-center">
          <form
            onSubmit={handleSearch}
            className="flex w-full bg-gray-50 border border-gray-300 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition"
          >
            <input
              type="text"
              value={search}
              onChange={handleChange}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 bg-transparent outline-none text-sm px-2"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-sm font-semibold transition flex items-center gap-1"
            >
              <Search size={16} />
              {loading ? '...' : 'Tìm'}
            </button>
          </form>

          {suggestions.length > 0 && (
            <div
              className="absolute left-0 top-full mt-2 w-full max-h-72 overflow-y-auto bg-white shadow-lg border border-gray-200 rounded-xl z-50"
              ref={wrapperRef}
            >
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  onClick={() => setSuggestions([])}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition"
                >
                  <img
                    src={p.imageUrl || '/no-image.png'}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-md"
                  />
                  <div>
                    <p className="text-gray-800 text-sm font-medium">
                      {highlightText(p.name, search)}
                    </p>
                    <p className="text-blue-600 text-xs font-semibold">
                      {p.price?.toLocaleString()}₫
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.dropdown && setDropdownOpen(true)}
              onMouseLeave={() => item.dropdown && setDropdownOpen(false)}
            >
              <Link
                href={item.href}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition flex items-center gap-1 relative group"
              >
                {item.name}
                {item.dropdown && <ChevronDown size={16} />}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {item.dropdown && dropdownOpen && categories.length > 0 && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-52 z-50 animate-fadeIn">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/categories/${c.id}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4 relative">
          <Link
            href="/cart"
            className="relative hover:text-blue-600 transition shrink-0"
          >
            <span className="text-3xl">🛒</span>
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {totalQty}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownUser(!dropdownUser)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm font-medium transition"
              >
                <User size={16} />
                {user.name || user.email}
                <ChevronDown size={14} />
              </button>

              {dropdownUser && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-xl w-44 z-50 animate-fadeIn">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setDropdownUser(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>

                  <Link
                    href="/wishlist"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setDropdownUser(false)}
                  >
                    Wishlist
                  </Link>

                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setDropdownUser(false)}
                  >
                    Đơn hàng
                  </Link>

                  <button
                    onClick={async () => {
                      await logout();
                      setDropdownUser(false);
                      router.push('/');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Đăng nhập
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            <Menu size={26} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden flex justify-end"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white w-72 h-full shadow-2xl p-6 relative z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-600 hover:text-red-500 transition"
              >
                <X size={22} />
              </button>
            </div>

            {menuItems.map((item) => (
              <div key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-lg font-medium text-gray-800 mb-2 hover:text-blue-600"
                >
                  {item.name}
                </Link>
                {item.dropdown && categories.length > 0 && (
                  <div className="ml-3 border-l border-gray-200 pl-3 space-y-1">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm text-gray-600 hover:text-blue-500"
                      >
                        • {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function highlightText(text, keyword) {
  if (!keyword) return [text];
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <strong key={i} className="text-blue-600">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
