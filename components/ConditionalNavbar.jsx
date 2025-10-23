'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return !isAdmin ? <Header /> : null;
}
