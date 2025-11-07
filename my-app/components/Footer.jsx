'use client';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">MyShop</h2>
          <p className="text-gray-400 mb-4">Đây là 1 cái của hàng phếch.</p>
          <div className="flex space-x-4">
            <Link
              href="https://facebook.com"
              target="_blank"
              className="hover:text-blue-500"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              className="hover:text-pink-500"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              className="hover:text-sky-400"
            >
              <Twitter size={20} />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Liên kết nhanh
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-white transition">
                Danh mục
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white transition">
                Giỏ hàng
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                Giới thiệu
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Tài khoản cá nhân
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link href="/profile" className="hover:text-white transition">
                Trang cá nhân
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-white transition">
                Đơn hàng
              </Link>
            </li>

            <li>
              <Link href="/wishlist" className="hover:text-white transition">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/return" className="hover:text-white transition">
                Đổi trả hàng
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Liên hệ với chúng tôi
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center gap-2">
              <MapPin size={18} className="text-blue-400" />
              123 Đường ABC, ABC, TP.H
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-blue-400" />
              +84 123 456 789
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="text-blue-400" />
              abc@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} MyShop. All rights reserved.
      </div>
    </footer>
  );
}
